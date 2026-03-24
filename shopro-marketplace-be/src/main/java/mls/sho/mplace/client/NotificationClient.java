package mls.sho.mplace.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.UUID;

/**
 * REST Client for the in-house Shopro Notification Hub.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${shopro.notification-hub.url:http://localhost:8080/api/notifications}")
    private String hubUrl;

    public void sendBidNotification(UUID recipientId, String type, String title, String content) {
        try {
            log.info("Dispatching {} notification to recipient: {}", type, recipientId);
            
            Map<String, Object> payload = Map.of(
                "recipientId", recipientId,
                "type", type,
                "title", title,
                "content", content,
                "channel", "IN_APP",
                "role", "SUPPLIER_ADMIN"
            );

            restTemplate.postForObject(hubUrl, payload, Map.class);
            log.info("Successfully dispatched notification to Hub.");
        } catch (Exception e) {
            log.error("Failed to dispatch notification to Hub: {}", e.getMessage());
        }
    }
}
