package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.dto.CreateBidRequest;
import mls.sho.mplace.entity.BidInvitation;
import mls.sho.mplace.entity.BidItem;
import mls.sho.mplace.entity.MarketplaceSupplier;
import mls.sho.mplace.entity.Quote;
import mls.sho.mplace.repository.BidInvitationRepository;
import mls.sho.mplace.repository.CategoryRepository;
import mls.sho.mplace.repository.QuoteRepository;
import mls.sho.mplace.util.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BidService {

    private final BidInvitationRepository bidInvitationRepository;
    private final QuoteRepository quoteRepository;
    private final CategoryRepository categoryRepository;
    private final SecurityUtils securityUtils;

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
        invitation.setStatus(BidInvitation.BidStatus.OPEN);

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

        return bidInvitationRepository.save(invitation);
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
    }

    public List<Quote> getQuotesForInvitation(UUID invitationId) {
        return quoteRepository.findByBidInvitation_Id(invitationId);
    }

    public List<Quote> getQuotesForSupplier(MarketplaceSupplier supplier) {
        return quoteRepository.findAllBySupplier_Id(supplier.getSupplierId());
    }
}
