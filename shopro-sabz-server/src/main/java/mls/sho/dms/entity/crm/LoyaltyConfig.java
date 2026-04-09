package mls.sho.dms.entity.crm;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

import java.math.BigDecimal;

/**
 * Singleton configuration for the loyalty program.
 * Only one row should exist; retrieved by the service via findFirst.
 */
@Entity
@Table(name = "loyalty_config")
public class LoyaltyConfig extends BaseEntity {

    /** Points earned per $1 spent (e.g., 1.00 = 1 point per dollar) */
    @Column(name = "earning_rate", nullable = false, precision = 6, scale = 2)
    private BigDecimal earningRate = BigDecimal.ONE;

    /** Dollar value per point when redeeming (e.g., 0.01 = 1 cent per point) */
    @Column(name = "redemption_value", nullable = false, precision = 6, scale = 4)
    private BigDecimal redemptionValue = new BigDecimal("0.01");

    /** Minimum number of points that can be redeemed in a single transaction */
    @Column(name = "minimum_redemption_points", nullable = false)
    private int minimumRedemptionPoints = 100;

    /** Number of days before points expire (0 = never expire) */
    @Column(name = "point_expiration_days", nullable = false)
    private int pointExpirationDays = 0;

    @Column(name = "default_sms_opt_in", nullable = false)
    private boolean defaultSmsOptIn = true;

    @Column(name = "default_email_opt_in", nullable = false)
    private boolean defaultEmailOptIn = true;

    @Column(name = "feedback_window_hours", nullable = false)
    private int feedbackWindowHours = 24;

    @Column(name = "sms_gateway_enabled", nullable = false)
    private boolean smsGatewayEnabled = false;

    @Column(name = "email_gateway_enabled", nullable = false)
    private boolean emailGatewayEnabled = false;

    public BigDecimal getEarningRate() { return earningRate; }
    public void setEarningRate(BigDecimal earningRate) { this.earningRate = earningRate; }
    public BigDecimal getRedemptionValue() { return redemptionValue; }
    public void setRedemptionValue(BigDecimal redemptionValue) { this.redemptionValue = redemptionValue; }
    public int getMinimumRedemptionPoints() { return minimumRedemptionPoints; }
    public void setMinimumRedemptionPoints(int minimumRedemptionPoints) { this.minimumRedemptionPoints = minimumRedemptionPoints; }
    public int getPointExpirationDays() { return pointExpirationDays; }
    public void setPointExpirationDays(int pointExpirationDays) { this.pointExpirationDays = pointExpirationDays; }
    public boolean isDefaultSmsOptIn() { return defaultSmsOptIn; }
    public void setDefaultSmsOptIn(boolean defaultSmsOptIn) { this.defaultSmsOptIn = defaultSmsOptIn; }
    public boolean isDefaultEmailOptIn() { return defaultEmailOptIn; }
    public void setDefaultEmailOptIn(boolean defaultEmailOptIn) { this.defaultEmailOptIn = defaultEmailOptIn; }
    public int getFeedbackWindowHours() { return feedbackWindowHours; }
    public void setFeedbackWindowHours(int feedbackWindowHours) { this.feedbackWindowHours = feedbackWindowHours; }
    public boolean isSmsGatewayEnabled() { return smsGatewayEnabled; }
    public void setSmsGatewayEnabled(boolean smsGatewayEnabled) { this.smsGatewayEnabled = smsGatewayEnabled; }
    public boolean isEmailGatewayEnabled() { return emailGatewayEnabled; }
    public void setEmailGatewayEnabled(boolean emailGatewayEnabled) { this.emailGatewayEnabled = emailGatewayEnabled; }
}
