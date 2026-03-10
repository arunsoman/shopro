package mls.sho.dms.application.service.inventory.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.service.inventory.AlertService;
import mls.sho.dms.application.service.core.NotificationEngine;
import mls.sho.dms.entity.notification.NotificationLog;
import mls.sho.dms.entity.notification.NotificationStatus;
import mls.sho.dms.entity.notification.NotificationType;
import mls.sho.dms.entity.inventory.RawIngredient;
import mls.sho.dms.repository.notification.NotificationLogRepository;
import mls.sho.dms.repository.notification.NotificationTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AlertServiceImpl implements AlertService {

    private final NotificationLogRepository notificationLogRepository;
    private final NotificationTypeRepository notificationTypeRepository;
    private final NotificationEngine notificationEngine;

    @Override
    public void sendSafetyStockAlert(RawIngredient ingredient) {
        String subject = "Safety Stock Alert: " + ingredient.getName();
        String body = String.format("%s has dropped below Safety Stock (%.2f). Current stock: %.2f.",
                ingredient.getName(), ingredient.getSafetyLevel(), ingredient.getCurrentStock());

        notificationEngine.sendNotification(
                "SYSTEM_WARNING",
                subject,
                body,
                Map.of("ingredientId", ingredient.getId().toString(), "category", "INVENTORY"),
                "LOW_STOCK_" + ingredient.getId()
        );
    }

    @Override
    public void sendCriticalStockAlert(RawIngredient ingredient) {
        String subject = "CRITICAL STOCK ALERT: " + ingredient.getName();
        String body = String.format("CRITICAL: %s stock at %.2f. Immediate action required.",
                ingredient.getName(), ingredient.getCurrentStock());

        notificationEngine.sendNotification(
                "STOCK_CRITICAL",
                subject,
                body,
                Map.of("ingredientId", ingredient.getId().toString(), "category", "INVENTORY"),
                "CRITICAL_STOCK_" + ingredient.getId()
        );
    }

    @Override
    public void dispatchEmail(String to, String subject, String body) {
        dispatchWithLog(to, subject, body, "EMAIL");
    }

    private void dispatchWithLog(String to, String subject, String body, String channel) {
        log.info("Sending {} to {}: [{}] {}", channel, to, subject, body);
        
        NotificationLog nLog = new NotificationLog();
        nLog.setDispatchId(UUID.randomUUID());
        nLog.setRecipientIdentifier(to);
        nLog.setPayload(Map.of("type", channel, "subject", subject != null ? subject : "", "body", body));
        nLog.setStatus(NotificationStatus.SENT);
        nLog.setSentAt(Instant.now());
        
        // Attempt to associate with a type if known from context (simplistic for now)
        String typeCode = subject != null && subject.contains("CRITICAL") ? "STOCK_CRITICAL" : 
                         (subject != null && subject.contains("Approval") ? "PO_APPROVAL" : "SYSTEM_WARNING");
        
        notificationTypeRepository.findByCode(typeCode).ifPresent(nLog::setNotificationType);
        
        notificationLogRepository.save(nLog);
    }

    @Override
    public void dispatchSms(String to, String body) {
        dispatchWithLog(to, null, body, "SMS");
    }

    @Override
    public void sendNotification(String to, String subject, String body) {
        // Dispatches both email and SMS for general notifications
        dispatchEmail(to, subject, body);
        if (to.matches(".*\\d+.*")) { // simplistic check for a phone number
            dispatchSms(to, body);
        }
    }
}
