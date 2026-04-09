package mls.sho.dms.application.service.order;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.dto.order.OTPResponse;
import mls.sho.dms.application.exception.BusinessRuleException;
import mls.sho.dms.application.exception.ResourceNotFoundException;
import mls.sho.dms.entity.order.OrderOTP;
import mls.sho.dms.entity.order.OrderTicket;
import mls.sho.dms.entity.order.TicketStatus;
import mls.sho.dms.repository.order.OrderOTPRepository;
import mls.sho.dms.repository.order.OrderTicketRepository;
import mls.sho.dms.service.edp.EdpPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OTPServiceImpl implements OTPService {

    private final OrderOTPRepository otpRepository;
    private final OrderTicketRepository ticketRepository;
    private final EdpPublisher edpPublisher;
    private final mls.sho.dms.application.service.core.NotificationEngine notificationEngine;

    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    @Transactional
    public String generateAndSaveOTP(UUID orderId) {
        OrderTicket ticket = ticketRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        // Logic: Generate only if not already verified and payment is good (handled by caller/event)
        String plainOtp = generateNumericOTP(6);
        String hashedOtp = hashOTP(plainOtp);

        OrderOTP otp = otpRepository.findByOrder(ticket).orElse(new OrderOTP());
        otp.setOrder(ticket);
        otp.setHashedOtp(hashedOtp);
        otp.setVerifiedAt(null);
        otp.setAttemptCount(0);
        
        // TTL Logic: Default 30 mins
        otp.setExpiryAt(Instant.now().plus(30, ChronoUnit.MINUTES));

        otpRepository.save(otp);

        edpPublisher.publish("order.otp_generated", Map.of(
            "orderId", orderId,
            "expiryAt", otp.getExpiryAt()
        ));

        return plainOtp;
    }

    @Override
    @Transactional
    public boolean verifyOTP(UUID orderId, String plainOtp, String staffId, String terminalId) {
        OrderOTP otp = otpRepository.findByOrderId(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("No OTP found for order: " + orderId));

        if (otp.isVerified()) {
            recordAudit(otp, staffId, terminalId, "RE-VERIFY", false, "OTP already verified");
            throw new BusinessRuleException("OTP already verified for this order.");
        }

        if (otp.isExpired()) {
            recordAudit(otp, staffId, terminalId, "VERIFY", false, "OTP expired");
            throw new BusinessRuleException("OTP has expired. Please request a new one.");
        }

        if (otp.getAttemptCount() >= 5) {
            recordAudit(otp, staffId, terminalId, "VERIFY", false, "Max attempts reached");
            throw new BusinessRuleException("Max verification attempts reached. Manager override required.");
        }

        String hashedAttempt = hashOTP(plainOtp);
        if (otp.getHashedOtp().equals(hashedAttempt)) {
            otp.setVerifiedAt(Instant.now());
            otpRepository.save(otp);

            // Transition Order State
            OrderTicket ticket = otp.getOrder();
            ticket.setStatus(TicketStatus.FULFILLING);
            ticketRepository.save(ticket);

            recordAudit(otp, staffId, terminalId, "VERIFY", true, "Success");
            
            edpPublisher.publish("order.otp_verified", Map.of(
                "orderId", orderId,
                "staffId", staffId,
                "terminalId", terminalId
            ));

            return true;
        } else {
            otp.setAttemptCount(otp.getAttemptCount() + 1);
            otpRepository.save(otp);
            recordAudit(otp, staffId, terminalId, "VERIFY", false, "Invalid OTP");
            return false;
        }
    }

    @Override
    @Transactional
    public String resendOTP(UUID orderId) {
        OrderOTP otp = otpRepository.findByOrderId(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("No OTP found for order: " + orderId));

        if (otp.getResendCount() >= 3) {
            throw new BusinessRuleException("Maximum resend attempts reached.");
        }

        String newPlainOtp = generateAndSaveOTP(orderId);
        
        // Refresh local ref to update resend count
        otp = otpRepository.findByOrderId(orderId).get();
        otp.setResendCount(otp.getResendCount() + 1);
        otpRepository.save(otp);

        return newPlainOtp;
    }

    @Override
    public boolean hasActiveOTP(UUID orderId) {
        return otpRepository.findByOrderId(orderId)
            .map(otp -> !otp.isVerified() && !otp.isExpired())
            .orElse(false);
    }

    @Override
    public OTPResponse getOTPStatus(UUID orderId) {
        OrderOTP otp = otpRepository.findByOrderId(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("No OTP found for order: " + orderId));

        return new OTPResponse(
            orderId,
            true,
            otp.isVerified(),
            otp.isExpired(),
            otp.getExpiryAt(),
            otp.getResendCount(),
            otp.getAttemptCount(),
            generateQRData(otp)
        );
    }

    private String generateNumericOTP(int length) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(secureRandom.nextInt(10));
        }
        return sb.toString();
    }

    private String hashOTP(String plainOtp) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(plainOtp.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }

    private String generateQRData(OrderOTP otp) {
        // Enforce: orderId:hashedToken (hashedToken could be another secret or part of hashedOtp)
        return otp.getOrder().getId().toString() + ":" + otp.getHashedOtp();
    }

    private void recordAudit(OrderOTP otp, String staffId, String terminalId, String type, boolean success, String reason) {
        // Log to console for now, should write to order_otp_audit table in a real impl
        log.info("OTP AUDIT | Order: {} | Staff: {} | Type: {} | Success: {} | Reason: {}", 
            otp.getOrder().getId(), staffId, type, success, reason);
        
        // EDP for audit service
        edpPublisher.publish("order.otp_audit", Map.of(
            "orderId", otp.getOrder().getId(),
            "staffId", staffId,
            "type", type,
            "success", success,
            "reason", reason
        ));
    }
}
