package mls.sho.dms.application.event.edp;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.service.order.OTPService;
import mls.sho.dms.entity.edp.EventStore;
import mls.sho.dms.service.edp.EventStoreService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

/**
 * Consumer that reacts to order payments by generating security OTPs.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class OrderOTPEventConsumer {

    private final OTPService otpService;
    private final EventStoreService eventStoreService;

    private static final String CONSUMER_NAME = "order_otp_generator";

    @EventListener
    @Transactional
    public void onOrderPaymentCompleted(EventStore event) {
        String type = event.getEventType();
        if (!"order.payment_completed".equals(type)) {
            return;
        }

        Map<String, Object> data = event.getPayload();
        log.info("[EDP] Payment confirmed for order {}. Triggering OTP generation.", data.get("orderId"));

        try {
            UUID orderId = UUID.fromString(data.get("orderId").toString());
            
            // 1. Generate OTP
            String plainOtp = otpService.generateAndSaveOTP(orderId);
            
            // 2. Deliver via SMS/Email (Handled by another consumer or within the service)
            log.info("[EDP] Generated OTP for Order {}: {}", orderId, plainOtp);
            
        } catch (Exception e) {
            log.error("[EDP] Failed to generate OTP for event {}: {}", event.getId(), e.getMessage());
        }

        // 3. Track checkpoint
        eventStoreService.updateCheckpoint(CONSUMER_NAME, event.getId());
    }
}
