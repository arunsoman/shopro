package mls.sho.dms.application.service.core;

import mls.sho.dms.application.dto.notification.NotificationManualTriggerRequest;

import java.util.Map;
import java.util.UUID;

/**
 * Service for dispatching and managing in-app notifications.
 */
public interface NotificationEngine {

    /**
     * Dispatches a notification to all mapped recipients for the given type code.
     */
    void sendNotification(String typeCode, String title, String body, 
                          Map<String, Object> data, String correlationId);

    /**
     * Recalls (dismisses) all unread notifications with the given correlation ID for a user.
     */
    void recallNotification(String correlationId, UUID userId);

    /**
     * Dispatches a manual notification based on administrative trigger.
     */
    void dispatchManualNotification(NotificationManualTriggerRequest request);

    /**
     * Syncs a notification's "read" state across all user's sessions.
     */
    void markAsRead(UUID notificationId);

    /**
     * Syncs a notification's "dismissed" state across all user's sessions.
     */
    void markAsDismissed(UUID notificationId);
}
