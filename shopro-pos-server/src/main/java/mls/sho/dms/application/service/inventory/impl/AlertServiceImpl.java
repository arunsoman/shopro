package mls.sho.dms.application.service.inventory.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.service.inventory.AlertService;
import mls.sho.dms.entity.inventory.NotificationLog;
import mls.sho.dms.entity.inventory.RawIngredient;
import mls.sho.dms.repository.inventory.NotificationLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AlertServiceImpl implements AlertService {

    private final NotificationLogRepository notificationLogRepository;

    @Override
    public void sendSafetyStockAlert(RawIngredient ingredient) {
        String subject = "Safety Stock Alert: " + ingredient.getName();
        String body = String.format("%s has dropped below Safety Stock (%.2f). Current stock: %.2f. Immediate action may be required.",
                ingredient.getName(), ingredient.getSafetyLevel(), ingredient.getCurrentStock());

        // In a real app we'd fetch the Inventory Manager and Head Chef emails
        String to = "manager@shopro.pos, headchef@shopro.pos";
        dispatchEmail(to, subject, body);
    }

    @Override
    public void sendCriticalStockAlert(RawIngredient ingredient) {
        String subject = "CRITICAL STOCK ALERT: " + ingredient.getName();
        String body = String.format("CRITICAL: %s stock at %.2f. Immediate action required.",
                ingredient.getName(), ingredient.getCurrentStock());

        // In a real app we'd fetch the GM and Head Chef phones and emails
        String toEmail = "gm@shopro.pos, headchef@shopro.pos";
        String toPhone = "+15550199999, +15550188888";

        dispatchSms(toPhone, body);
        dispatchEmail(toEmail, subject, body);
    }

    @Override
    public void dispatchEmail(String to, String subject, String body) {
        log.info("Sending EMAIL to {}: [{}] {}", to, subject, body);
        
        NotificationLog nLog = new NotificationLog();
        nLog.setType(NotificationLog.NotificationType.EMAIL);
        nLog.setRecipient(to);
        nLog.setSubject(subject);
        nLog.setMessage(body);
        nLog.setStatus(NotificationLog.NotificationStatus.SENT);
        nLog.setSentAt(Instant.now());
        
        notificationLogRepository.save(nLog);
    }

    @Override
    public void dispatchSms(String to, String body) {
        log.info("Sending SMS to {}: {}", to, body);
        
        NotificationLog nLog = new NotificationLog();
        nLog.setType(NotificationLog.NotificationType.SMS);
        nLog.setRecipient(to);
        nLog.setMessage(body);
        nLog.setStatus(NotificationLog.NotificationStatus.SENT);
        nLog.setSentAt(Instant.now());
        notificationLogRepository.save(nLog);
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
