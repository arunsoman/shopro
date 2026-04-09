package mls.sho.dms.application.service.inventory.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.event.inventory.POStateChangedEvent;
import mls.sho.dms.application.service.inventory.POStateMachineService;
import mls.sho.dms.entity.inventory.POStatusHistory;
import mls.sho.dms.entity.inventory.PurchaseOrder;
import mls.sho.dms.entity.inventory.PurchaseOrderStatus;
import mls.sho.dms.repository.inventory.POStatusHistoryRepository;
import mls.sho.dms.repository.inventory.PurchaseOrderRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class POStateMachineServiceImpl implements POStateMachineService {

    private final PurchaseOrderRepository poRepository;
    private final POStatusHistoryRepository poHistoryRepository;
    private final ApplicationEventPublisher eventPublisher;

    private static final Map<PurchaseOrderStatus, Set<PurchaseOrderStatus>> ALLOWED_TRANSITIONS = new EnumMap<>(PurchaseOrderStatus.class);

    static {
        ALLOWED_TRANSITIONS.put(PurchaseOrderStatus.DRAFT, EnumSet.of(PurchaseOrderStatus.PENDING_APPROVAL, PurchaseOrderStatus.APPROVED, PurchaseOrderStatus.SENT, PurchaseOrderStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(PurchaseOrderStatus.PENDING_APPROVAL, EnumSet.of(PurchaseOrderStatus.APPROVED, PurchaseOrderStatus.REJECTED));
        ALLOWED_TRANSITIONS.put(PurchaseOrderStatus.REJECTED, EnumSet.of(PurchaseOrderStatus.DRAFT));
        ALLOWED_TRANSITIONS.put(PurchaseOrderStatus.APPROVED, EnumSet.of(PurchaseOrderStatus.SENT));
        ALLOWED_TRANSITIONS.put(PurchaseOrderStatus.SENT, EnumSet.of(PurchaseOrderStatus.ACKNOWLEDGED, PurchaseOrderStatus.COUNTER_OFFERED, PurchaseOrderStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(PurchaseOrderStatus.COUNTER_OFFERED, EnumSet.of(PurchaseOrderStatus.SENT, PurchaseOrderStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(PurchaseOrderStatus.ACKNOWLEDGED, EnumSet.of(PurchaseOrderStatus.SHIPPED));
        ALLOWED_TRANSITIONS.put(PurchaseOrderStatus.SHIPPED, EnumSet.of(PurchaseOrderStatus.RECEIVED, PurchaseOrderStatus.PARTIALLY_RECEIVED, PurchaseOrderStatus.GRN_FLAGGED));
        ALLOWED_TRANSITIONS.put(PurchaseOrderStatus.PARTIALLY_RECEIVED, EnumSet.of(PurchaseOrderStatus.RECEIVED, PurchaseOrderStatus.GRN_FLAGGED));
        ALLOWED_TRANSITIONS.put(PurchaseOrderStatus.GRN_FLAGGED, EnumSet.of(PurchaseOrderStatus.DISCREPANCY_REVIEW));
        ALLOWED_TRANSITIONS.put(PurchaseOrderStatus.RECEIVED, EnumSet.of(PurchaseOrderStatus.INVOICE_MATCHED, PurchaseOrderStatus.DISCREPANCY_REVIEW));
        ALLOWED_TRANSITIONS.put(PurchaseOrderStatus.DISCREPANCY_REVIEW, EnumSet.of(PurchaseOrderStatus.RECEIVED, PurchaseOrderStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(PurchaseOrderStatus.INVOICE_MATCHED, EnumSet.of(PurchaseOrderStatus.PAID));
        ALLOWED_TRANSITIONS.put(PurchaseOrderStatus.PAID, EnumSet.of(PurchaseOrderStatus.CLOSED));
        // CLOSED and CANCELLED are terminal states
    }

    @Override
    @Transactional
    public void transition(UUID poId, PurchaseOrderStatus targetState, UUID actorId, String reason) {
        PurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new IllegalArgumentException("Purchase Order not found: " + poId));

        PurchaseOrderStatus fromStatus = po.getStatus();

        if (!isTransitionAllowed(fromStatus, targetState)) {
            throw new IllegalStateException(String.format("Invalid PO transition from %s to %s", fromStatus, targetState));
        }

        log.info("Transitioning PO {} from {} to {} by actor {}", poId, fromStatus, targetState, actorId);

        po.setStatus(targetState);
        poRepository.save(po);

        saveHistory(po, fromStatus, targetState, actorId, reason);

        eventPublisher.publishEvent(new POStateChangedEvent(this, po, fromStatus, targetState, actorId, reason));
    }

    @Override
    public Set<PurchaseOrderStatus> getAllowedTransitions(UUID poId) {
        PurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new IllegalArgumentException("Purchase Order not found: " + poId));
        return ALLOWED_TRANSITIONS.getOrDefault(po.getStatus(), Collections.emptySet());
    }

    private boolean isTransitionAllowed(PurchaseOrderStatus from, PurchaseOrderStatus to) {
        Set<PurchaseOrderStatus> allowed = ALLOWED_TRANSITIONS.get(from);
        return allowed != null && allowed.contains(to);
    }

    private void saveHistory(PurchaseOrder po, PurchaseOrderStatus from, PurchaseOrderStatus to, UUID actorId, String reason) {
        POStatusHistory history = new POStatusHistory();
        history.setPurchaseOrder(po);
        history.setFromStatus(from);
        history.setToStatus(to);
        history.setActorId(actorId);
        history.setReason(reason);
        poHistoryRepository.save(history);
    }
}
