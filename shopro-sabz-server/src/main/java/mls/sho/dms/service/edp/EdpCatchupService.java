package mls.sho.dms.service.edp;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.entity.edp.EventConsumerCheckpoint;
import mls.sho.dms.entity.edp.EventStore;
import mls.sho.dms.repository.edp.EventConsumerCheckpointRepository;
import mls.sho.dms.repository.edp.EventStoreRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Resilience service that periodically checks for unprocessed events.
 * If a consumer's checkpoint is behind the latest event_store ID, 
 * this service "re-pulses" the missed events into the Spring Event Bus.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class EdpCatchupService {

    private final EventStoreRepository eventStoreRepository;
    private final EventConsumerCheckpointRepository checkpointRepository;
    private final ApplicationEventPublisher applicationEventPublisher;

    /**
     * Runs every 30 seconds to catch any events that might have failed to trigger
     * a pulse due to transient errors or system restarts.
     */
    @Scheduled(fixedDelay = 30000)
    @Transactional
    public void runCatchup() {
        log.debug("[EDP-CATCHUP] Running consumer health check...");
        
        List<EventConsumerCheckpoint> checkpoints = checkpointRepository.findAll();
        if (checkpoints.isEmpty()) return;

        Long latestEventId = eventStoreRepository.findMaxId();
        if (latestEventId == null) return;

        for (EventConsumerCheckpoint checkpoint : checkpoints) {
            if (checkpoint.getLastProcessedEventId() < latestEventId) {
                processMissedEvents(checkpoint, latestEventId);
            }
        }
    }

    private void processMissedEvents(EventConsumerCheckpoint checkpoint, Long latestId) {
        log.warn("[EDP-CATCHUP] Consumer {} is behind! Catching up from {} to {}", 
            checkpoint.getConsumerId(), checkpoint.getLastProcessedEventId(), latestId);

        // Fetch missed events for THIS consumer
        List<EventStore> missedEvents = eventStoreRepository.findByIdGreaterThanOrderByIdAsc(
            checkpoint.getLastProcessedEventId()
        );

        for (EventStore event : missedEvents) {
            log.info("[EDP-CATCHUP] Re-pulsing event {} for {}", event.getId(), checkpoint.getConsumerId());
            // We pulse them into the Spring environment. 
            // Consumers are responsible for idempotency via checkpoint updates.
            applicationEventPublisher.publishEvent(event);
        }
    }
}
