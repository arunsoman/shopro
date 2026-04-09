package mls.sho.dms.application.service.inventory.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.event.inventory.BidStateChangedEvent;
import mls.sho.dms.application.service.inventory.BidStateMachineService;
import mls.sho.dms.application.service.inventory.POStateMachineService;
import mls.sho.dms.entity.inventory.procurement.PurchaseOrderStatus;
import mls.sho.dms.entity.inventory.vendor.VendorBid;
import mls.sho.dms.entity.inventory.vendor.VendorBidStatus;
import mls.sho.dms.repository.inventory.VendorBidRepository;
import mls.sho.dms.repository.inventory.PurchaseOrderRepository;
import mls.sho.dms.entity.inventory.procurement.PurchaseOrder;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class BidStateMachineServiceImpl implements BidStateMachineService {

    private final VendorBidRepository bidRepository;
    private final PurchaseOrderRepository poRepository;
    private final POStateMachineService poStateMachineService;
    private final ApplicationEventPublisher eventPublisher;

    private static final Map<VendorBidStatus, Set<VendorBidStatus>> ALLOWED_TRANSITIONS = new EnumMap<>(VendorBidStatus.class);

    static {
        ALLOWED_TRANSITIONS.put(VendorBidStatus.SUBMITTED, EnumSet.of(VendorBidStatus.WON, VendorBidStatus.LOST, VendorBidStatus.REJECTED));
        ALLOWED_TRANSITIONS.put(VendorBidStatus.WON, EnumSet.of(VendorBidStatus.ACKNOWLEDGED, VendorBidStatus.UNACKED, VendorBidStatus.REJECTED));
    }

    @Override
    @Transactional
    public void transition(UUID bidId, VendorBidStatus targetState, UUID actorId, String reason) {
        VendorBid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor Bid not found: " + bidId));

        VendorBidStatus fromStatus = bid.getStatus();

        if (!isTransitionAllowed(fromStatus, targetState)) {
            throw new IllegalStateException(String.format("Invalid Bid transition from %s to %s", fromStatus, targetState));
        }

        log.info("Transitioning Bid {} from {} to {} by actor {}", bidId, fromStatus, targetState, actorId);

        bid.setStatus(targetState);
        
        // Side effects on PO (now linked via RFQ)
        Optional<PurchaseOrder> poOpt = poRepository.findByRfqId(bid.getRfq().getId());

        if (targetState == VendorBidStatus.WON) {
            bid.setAwardedAt(Instant.now());
            poOpt.ifPresent(po -> poStateMachineService.transition(po.getId(), PurchaseOrderStatus.SENT, actorId, "Bid Awarded"));
        } else if (targetState == VendorBidStatus.ACKNOWLEDGED) {
            poOpt.ifPresent(po -> poStateMachineService.transition(po.getId(), PurchaseOrderStatus.ACKNOWLEDGED, actorId, "Supplier Acknowledged"));
        } else if (targetState == VendorBidStatus.UNACKED || targetState == VendorBidStatus.LOST || targetState == VendorBidStatus.REJECTED) {
            poOpt.ifPresent(po -> {
                if (po.getStatus() != PurchaseOrderStatus.CANCELLED) {
                    poStateMachineService.transition(po.getId(), PurchaseOrderStatus.CANCELLED, actorId, "Bid " + targetState);
                }
            });
        }

        bidRepository.save(bid);
        eventPublisher.publishEvent(new BidStateChangedEvent(this, bid, fromStatus, targetState, actorId, reason));
    }

    private boolean isTransitionAllowed(VendorBidStatus from, VendorBidStatus to) {
        Set<VendorBidStatus> allowed = ALLOWED_TRANSITIONS.get(from);
        return allowed != null && allowed.contains(to);
    }
}
