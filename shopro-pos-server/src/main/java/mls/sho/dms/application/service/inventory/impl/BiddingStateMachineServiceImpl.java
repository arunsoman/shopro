package mls.sho.dms.application.service.inventory.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.event.inventory.RFQStateChangedEvent;
import mls.sho.dms.application.service.inventory.BiddingStateMachineService;
import mls.sho.dms.entity.inventory.procurement.RFQ;
import mls.sho.dms.entity.inventory.procurement.RFQStatusHistory;
import mls.sho.dms.entity.inventory.procurement.RfqStatus;
import mls.sho.dms.repository.inventory.RFQRepository;
import mls.sho.dms.repository.inventory.RFQStatusHistoryRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class BiddingStateMachineServiceImpl implements BiddingStateMachineService {

    private final RFQRepository rfqRepository;
    private final RFQStatusHistoryRepository rfqHistoryRepository;
    private final ApplicationEventPublisher eventPublisher;

    private static final Map<RfqStatus, Set<RfqStatus>> ALLOWED_TRANSITIONS = new EnumMap<>(RfqStatus.class);

    static {
        ALLOWED_TRANSITIONS.put(RfqStatus.OPEN, EnumSet.of(RfqStatus.PENDING_REVIEW, RfqStatus.CLOSED, RfqStatus.CANCELLED, RfqStatus.AWARDED, RfqStatus.FAILED));
        ALLOWED_TRANSITIONS.put(RfqStatus.PENDING_REVIEW, EnumSet.of(RfqStatus.AWARDED, RfqStatus.FAILED, RfqStatus.CANCELLED));
        // AWARDED, FAILED, CLOSED, CANCELLED are terminal
    }

    @Override
    @Transactional
    public void transition(UUID rfqId, RfqStatus targetState, UUID actorId, String reason) {
        RFQ rfq = rfqRepository.findById(rfqId)
                .orElseThrow(() -> new IllegalArgumentException("RFQ not found: " + rfqId));

        RfqStatus fromStatus = rfq.getStatus();

        if (fromStatus == targetState) {
            return;
        }

        if (!isTransitionAllowed(fromStatus, targetState)) {
            throw new IllegalStateException(String.format("Invalid RFQ transition from %s to %s", fromStatus, targetState));
        }

        log.info("Transitioning RFQ {} from {} to {} by actor {}", rfqId, fromStatus, targetState, actorId);

        rfq.setStatus(targetState);
        rfqRepository.save(rfq);

        saveHistory(rfq, fromStatus, targetState, actorId, reason);

        eventPublisher.publishEvent(new RFQStateChangedEvent(this, rfq, fromStatus, targetState, actorId, reason));
    }

    @Override
    public Set<RfqStatus> getAllowedTransitions(UUID rfqId) {
        RFQ rfq = rfqRepository.findById(rfqId)
                .orElseThrow(() -> new IllegalArgumentException("RFQ not found: " + rfqId));
        return ALLOWED_TRANSITIONS.getOrDefault(rfq.getStatus(), Collections.emptySet());
    }

    private boolean isTransitionAllowed(RfqStatus from, RfqStatus to) {
        Set<RfqStatus> allowed = ALLOWED_TRANSITIONS.get(from);
        return allowed != null && allowed.contains(to);
    }

    private void saveHistory(RFQ rfq, RfqStatus from, RfqStatus to, UUID actorId, String reason) {
        RFQStatusHistory history = new RFQStatusHistory();
        history.setRfq(rfq);
        history.setFromStatus(from);
        history.setToStatus(to);
        history.setActorId(actorId);
        history.setReason(reason);
        rfqHistoryRepository.save(history);
    }
}
