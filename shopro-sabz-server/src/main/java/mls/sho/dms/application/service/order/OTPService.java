package mls.sho.dms.application.service.order;

import mls.sho.dms.application.dto.order.OTPResponse;
import java.util.UUID;

/**
 * Service for managing post-payment Order OTPs for identity verification.
 */
public interface OTPService {

    /**
     * Generates a new 6-digit OTP for the given order if payment is confirmed.
     * Persists the hashed OTP and returns the plain-text OTP for delivery.
     */
    String generateAndSaveOTP(UUID orderId);

    /**
     * Verifies the provided plain-text OTP against the hashed value for an order.
     * Marks the OTP as verified and transitions the order state if successful.
     */
    boolean verifyOTP(UUID orderId, String plainOtp, String staffId, String terminalId);

    /**
     * Resends a new OTP for the order, invalidating any previous ones.
     * Rate-limited to max 3 resends per order.
     */
    String resendOTP(UUID orderId);

    /**
     * Checks if an order has a valid, unverified OTP.
     */
    boolean hasActiveOTP(UUID orderId);
    
    /**
     * Retrieves the current OTP status for an order (for UI display).
     */
    OTPResponse getOTPStatus(UUID orderId);
}
