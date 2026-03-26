package mls.sho.dms.service.edp;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.entity.edp.EventStore;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EdpPublisher {

    private final EventStoreService eventStoreService;
    private final ApplicationEventPublisher applicationEventPublisher;

    /**
     * Publishes a system event. 
     * 1. Persists to event_store (synchronous, part of current transaction).
     * 2. Publishes to Spring ApplicationEventPublisher for internal consumers.
     */
    @Transactional
    public void publish(String eventType, Map<String, Object> payload) {
        log.info("Publishing EDP event: {}", eventType);
        
        // 1. Persist (Guarantees durability within the transaction)
        EventStore savedEvent = eventStoreService.append(eventType, payload);
        
        // 2. Pulse (Propagate internally to @EventListeners)
        applicationEventPublisher.publishEvent(savedEvent);
    }
}
