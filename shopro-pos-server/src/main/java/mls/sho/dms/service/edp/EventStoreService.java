package mls.sho.dms.service.edp;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.entity.edp.EventConsumerCheckpoint;
import mls.sho.dms.entity.edp.EventStore;
import mls.sho.dms.repository.edp.EventConsumerCheckpointRepository;
import mls.sho.dms.repository.edp.EventStoreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventStoreService {

    private final EventStoreRepository eventStoreRepository;
    private final EventConsumerCheckpointRepository checkpointRepository;

    @Transactional(propagation = Propagation.MANDATORY)
    public EventStore append(String eventType, Map<String, Object> payload) {
        log.debug("Appending event {} to store", eventType);
        EventStore event = EventStore.builder()
                .eventId(UUID.randomUUID())
                .eventType(eventType)
                .timestamp(Instant.now())
                .payload(payload)
                .build();
        return eventStoreRepository.save(event);
    }

    @Transactional(readOnly = true)
    public List<EventStore> findEventsAfter(String consumerId) {
        Long lastId = checkpointRepository.findById(consumerId)
                .map(EventConsumerCheckpoint::getLastProcessedEventId)
                .orElse(0L);
        return eventStoreRepository.findEventsAfter(lastId);
    }

    @Transactional
    public void updateCheckpoint(String consumerId, Long lastEventId) {
        log.debug("Updating checkpoint for consumer {} to {}", consumerId, lastEventId);
        EventConsumerCheckpoint checkpoint = checkpointRepository.findById(consumerId)
                .orElse(new EventConsumerCheckpoint(consumerId, 0L, Instant.now()));
        
        checkpoint.setLastProcessedEventId(lastEventId);
        checkpointRepository.save(checkpoint);
    }
}
