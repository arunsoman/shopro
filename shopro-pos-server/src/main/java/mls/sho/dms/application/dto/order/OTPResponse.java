package mls.sho.dms.application.dto.order;

import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO for Order OTP status.
 */
public record OTPResponse(
    UUID orderId,
    boolean isGenerated,
    boolean isVerified,
    boolean isExpired,
    Instant expiryAt,
    int resendCount,
    int attemptCount,
    String qrData // Base64 or signed token for QR generation
) {}
