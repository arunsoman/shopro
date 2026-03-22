package mls.sho.mplace.service;

import com.github.jknack.handlebars.Handlebars;
import com.github.jknack.handlebars.Template;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.mplace.entity.*;
import mls.sho.mplace.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotifyService {

    private final NotificationTypeRepository typeRepository;
    private final NotificationTemplateRepository templateRepository;
    private final NotificationLogRepository logRepository;
    private final InAppNotificationRepository inAppRepository;
    // Assume we have a WebSocket service or handler
    // private final NotificationWebSocketHandler webSocketHandler;

    private final Handlebars handlebars = new Handlebars();

    @Transactional
    public void send(String typeCode, UUID recipientId, Map<String, Object> context) {
        NotificationType type = typeRepository.findByCode(typeCode)
                .orElseThrow(() -> new IllegalArgumentException("Unknown notification type: " + typeCode));

        if (!type.isActive()) return;

        // Logic to find templates for this type across enabled channels
        // For simplicity in this first iteration, we'll focus on IN_APP
        
        // 1. Log the intent
        UUID dispatchId = UUID.randomUUID();
        
        // 2. Handle IN_APP
        handleInApp(type, recipientId, context, dispatchId);
        
        // 3. Handle other channels (Placeholder)
        log.info("Notification {} dispatched to recipient {}", typeCode, recipientId);
    }

    private void handleInApp(NotificationType type, UUID recipientId, Map<String, Object> context, UUID dispatchId) {
        try {
            // Find template for IN_APP
            // Placeholder: In a real system, we'd fetch from DB
            String bodyTemplate = (String) context.getOrDefault("template", "You have a new message");
            Template template = handlebars.compileInline(bodyTemplate);
            String renderedBody = template.apply(context);

            InAppNotification inApp = new InAppNotification();
            inApp.setRecipientId(recipientId);
            inApp.setTypeCode(type.getCode());
            inApp.setTitle(type.getName());
            inApp.setBody(renderedBody);
            inApp.setCreatedAt(LocalDateTime.now());
            // inApp.setData(objectMapper.writeValueAsString(context));
            
            inAppRepository.save(inApp);

            // Log Success
            NotificationLog nl = new NotificationLog();
            nl.setDispatchId(dispatchId);
            nl.setNotificationType(type);
            nl.setRecipientIdentifier(recipientId.toString());
            nl.setStatus(NotificationLog.LogStatus.SENT);
            nl.setSentAt(LocalDateTime.now());
            logRepository.save(nl);

            // Notify via WebSocket (Placeholder for now)
            // webSocketHandler.sendToUser(recipientId, inApp);

        } catch (IOException e) {
            log.error("Failed to render/send in-app notification", e);
        }
    }
}
