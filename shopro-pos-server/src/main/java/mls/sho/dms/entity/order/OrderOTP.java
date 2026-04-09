package mls.sho.dms.entity.order;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

import java.time.Instant;

/**
 * Represents a single-use OTP for order verification at physical fulfillment points.
 * Generated post-payment and verified by staff.
 */
@Entity
@Table(name = "order_otp")
public class OrderOTP extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private OrderTicket order;

    @Column(name = "hashed_otp", nullable = false)
    private String hashedOtp;

    @Column(name = "expiry_at", nullable = false)
    private Instant expiryAt;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "attempt_count", nullable = false)
    private int attemptCount = 0;

    @Column(name = "resend_count", nullable = false)
    private int resendCount = 0;

    public OrderTicket getOrder() { return order; }
    public void setOrder(OrderTicket order) { this.order = order; }

    public String getHashedOtp() { return hashedOtp; }
    public void setHashedOtp(String hashedOtp) { this.hashedOtp = hashedOtp; }

    public Instant getExpiryAt() { return expiryAt; }
    public void setExpiryAt(Instant expiryAt) { this.expiryAt = expiryAt; }

    public Instant getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(Instant verifiedAt) { this.verifiedAt = verifiedAt; }

    public int getAttemptCount() { return attemptCount; }
    public void setAttemptCount(int attemptCount) { this.attemptCount = attemptCount; }

    public int getResendCount() { return resendCount; }
    public void setResendCount(int resendCount) { this.resendCount = resendCount; }

    public boolean isExpired() {
        return Instant.now().isAfter(expiryAt);
    }

    public boolean isVerified() {
        return verifiedAt != null;
    }
}
