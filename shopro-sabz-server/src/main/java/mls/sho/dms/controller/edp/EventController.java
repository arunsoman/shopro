package mls.sho.dms.controller.edp;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.service.edp.EdpPublisher;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Gateway for receiving events from external systems (Flutter/React).
 */
@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
@Slf4j
public class EventController {

    private final EdpPublisher edpPublisher;
    private final mls.sho.dms.repository.edp.EventStoreRepository eventStoreRepository;

    @PostMapping
    public void publishEvent(@RequestBody Map<String, Object> request) {
        String eventType = (String) request.get("eventType");
        @SuppressWarnings("unchecked")
        Map<String, Object> payload = (Map<String, Object>) request.get("payload");

        if (eventType == null || payload == null) {
            throw new IllegalArgumentException("Invalid event format. Required: eventType and payload.");
        }

        log.debug("Received event via API: {}", eventType);
        edpPublisher.publish(eventType, payload);
    }

    @GetMapping("/catchup")
    public java.util.List<mls.sho.dms.entity.edp.EventStore> catchup(@RequestParam Long sinceId) {
        log.debug("Catchup requested since ID: {}", sinceId);
        return eventStoreRepository.findByIdGreaterThanOrderByIdAsc(sinceId);
    }
}
