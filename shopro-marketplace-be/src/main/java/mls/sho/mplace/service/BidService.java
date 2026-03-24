package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.dto.*;
import mls.sho.mplace.entity.*;
import mls.sho.mplace.repository.*;
import mls.sho.mplace.util.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BidService {

    private final BidInvitationRepository bidInvitationRepository;
    private final QuoteRepository quoteRepository;
    private final CategoryRepository categoryRepository;
    private final SecurityUtils securityUtils;
    private final SupplyListRepository supplyListRepository;
    private final SupplierRepository supplierRepository;
    private final mls.sho.mplace.client.NotificationClient notificationClient;
    private final mls.sho.mplace.repository.InAppNotificationRepository inAppNotificationRepository;

    public List<BidInvitation> getInvitations() {
        var requester = securityUtils.getCurrentRequester();
        if (requester == null) return Collections.emptyList();
        
        if (requester.isBuyer()) {
            return bidInvitationRepository.findAllByRestaurant_Id(requester.restaurantId());
        }
        return bidInvitationRepository.findAll();
    }

    public List<BidInvitation> getAllInvitations() {
        return bidInvitationRepository.findAll();
    }

    public BidInvitation getInvitationById(UUID id) {
        return bidInvitationRepository.findById(id).orElse(null);
    }

    public List<Quote> getQuotesByInvitationId(UUID id) {
        return quoteRepository.findByBidInvitation_Id(id);
    }

    @Transactional
    public BidInvitation createBidInvitation(CreateBidRequest request) {
        BidInvitation invitation = new BidInvitation();
        invitation.setTitle(request.title());
        invitation.setDescription(request.description());
        invitation.setDeadline(request.deadline());
        invitation.setUrgency(request.urgency());
        invitation.setOperationMode(request.operationMode() != null ? request.operationMode() : OperationMode.MANUAL);
        invitation.setRepeatFrequency(request.repeatFrequency() != null ? request.repeatFrequency() : RepeatFrequency.NONE);
        invitation.setStatus(BidInvitation.BidStatus.OPEN);

        if (invitation.getRepeatFrequency() != RepeatFrequency.NONE) {
            invitation.setNextRunDate(calculateNextRun(invitation.getRepeatFrequency()));
        }

        if (request.categoryId() != null) {
            invitation.setCategory(categoryRepository.findById(request.categoryId()).orElse(null));
        }

        if (request.items() != null) {
            for (var itemReq : request.items()) {
                BidItem item = new BidItem();
                item.setProductName(itemReq.productName());
                item.setQuantity(java.math.BigDecimal.valueOf(itemReq.quantity()));
                item.setUnit(itemReq.unit());
                item.setBidInvitation(invitation);
                invitation.getItems().add(item);
            }
        }

        BidInvitation saved = bidInvitationRepository.save(invitation);
        
        // Dispatch notifications to all relevant suppliers (mocked broadcast for now)
        notificationClient.sendBidNotification(null, "BID_INVITATION", saved.getTitle(), 
            "A new bid invitation for " + saved.getTitle() + " has been launched.");
        
        saveInternalNotification(null, "BID_INVITATION", saved.getTitle(),
            "A new bid invitation for " + saved.getTitle() + " has been launched.");
            
        triggerAutoQuotes(saved);
        return saved;
    }

    private void triggerAutoQuotes(BidInvitation invitation) {
        for (BidItem item : invitation.getItems()) {
            List<SupplyList> matches = supplyListRepository.findAll().stream()
                    .filter(sl -> sl.getAutoResponseMode() && sl.getIsAvailable() && sl.getOfferCount() > 0)
                    .filter(sl -> sl.getName().equalsIgnoreCase(item.getProductName()))
                    .toList();

            for (SupplyList sl : matches) {
                if (sl.getOfferCount() == null || sl.getOfferCount() <= 0 || sl.getPrice() == null) {
                    continue;
                }

                // Check if already quoted
                if (quoteRepository.findByBidInvitation_Id(invitation.getId()).stream()
                        .anyMatch(q -> q.getSupplier().getId().equals(sl.getSupplierId()))) {
                    continue;
                }

                Quote quote = new Quote();
                quote.setBidInvitation(invitation);
                
                Supplier supplier = supplierRepository.findById(sl.getSupplierId()).orElse(null);
                if (supplier == null) continue;
                
                quote.setSupplier(supplier);
                
                BigDecimal qtyRequested = item.getQuantity();
                if (qtyRequested == null) qtyRequested = BigDecimal.ZERO;

                BigDecimal qtyAvailable = BigDecimal.valueOf(sl.getOfferCount());
                
                if (qtyRequested.compareTo(qtyAvailable) <= 0) {
                    // Full Auto-Quote
                    quote.setTotalAmount(sl.getPrice().multiply(qtyRequested));
                    sl.setOfferCount(sl.getOfferCount() - qtyRequested.intValue());
                } else {
                    // Partial Auto-Quote (Shortfall scenario)
                    quote.setTotalAmount(sl.getPrice().multiply(qtyAvailable));
                    sl.setOfferCount(0);
                }
                
                quoteRepository.save(quote);
                supplyListRepository.save(sl);
            }
        }
    }

    @Transactional
    public void awardBid(UUID id, UUID quoteId) {
        BidInvitation invitation = bidInvitationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bid invitation not found"));
        Quote quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new RuntimeException("Quote not found"));

        invitation.setStatus(BidInvitation.BidStatus.AWARDED);
        quote.setStatus(Quote.QuoteStatus.ACCEPTED);
        
        bidInvitationRepository.save(invitation);
        quoteRepository.save(quote);

        // Notify winner and operator
        notificationClient.sendBidNotification(quote.getSupplier().getId(), "BID_AWARDED", invitation.getTitle(),
            "Congratulations! Your quote for the bid " + invitation.getTitle() + " has been accepted.");
            
        saveInternalNotification(quote.getSupplier().getId(), "BID_AWARDED", invitation.getTitle(),
            "Congratulations! Your quote for the bid " + invitation.getTitle() + " has been accepted.");
    }

    public List<Quote> getQuotesForInvitation(UUID invitationId) {
        return quoteRepository.findByBidInvitation_Id(invitationId);
    }

    public List<Quote> getQuotesForSupplier(java.util.UUID supplierId) {
        return quoteRepository.findAllBySupplier_Id(supplierId);
    }

    private LocalDateTime calculateNextRun(RepeatFrequency frequency) {
        LocalDateTime now = LocalDateTime.now();
        return switch (frequency) {
            case DAILY -> now.plusDays(1);
            case WEEKLY -> now.plusWeeks(1);
            case MONTHLY -> now.plusMonths(1);
            default -> null;
        };
    }

    private void saveInternalNotification(UUID recipientId, String typeCode, String title, String body) {
        InAppNotification n = new InAppNotification();
        n.setRecipientId(recipientId != null ? recipientId : UUID.nameUUIDFromBytes("GLOBAL".getBytes()));
        n.setTypeCode(typeCode);
        n.setTitle(title);
        n.setBody(body);
        inAppNotificationRepository.save(n);
    }
}
