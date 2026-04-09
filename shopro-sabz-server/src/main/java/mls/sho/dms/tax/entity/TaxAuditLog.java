package mls.sho.dms.tax.entity;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Immutable audit trail for tax configuration changes.
 */
@Entity
@Table(name = "tax_audit_logs", indexes = {
    @Index(name = "idx_tax_audit_venue_time", columnList = "venue_id, changed_at DESC")
})
public class TaxAuditLog extends BaseEntity {

    @Column(name = "venue_id", nullable = false)
    private UUID venueId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tax_rule_id")
    private TaxRule taxRule;

    @Column(name = "action", nullable = false, length = 30)
    private String action; // OVERRIDE_SET, OVERRIDE_REMOVED, COUNTRY_CHANGED, COUNTRY_ASSIGNED

    @Column(name = "old_rate", precision = 6, scale = 4)
    private BigDecimal oldRate;

    @Column(name = "new_rate", precision = 6, scale = 4)
    private BigDecimal newRate;

    @Column(name = "changed_by", nullable = false)
    private UUID changedBy;

    @Column(name = "changed_at", nullable = false)
    private Instant changedAt = Instant.now();

    @Column(name = "change_reason", columnDefinition = "TEXT")
    private String changeReason;

    @Column(name = "ip_address")
    private String ipAddress;

    public UUID getVenueId() { return venueId; }
    public void setVenueId(UUID venueId) { this.venueId = venueId; }
    public TaxRule getTaxRule() { return taxRule; }
    public void setTaxRule(TaxRule taxRule) { this.taxRule = taxRule; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public BigDecimal getOldRate() { return oldRate; }
    public void setOldRate(BigDecimal oldRate) { this.oldRate = oldRate; }
    public BigDecimal getNewRate() { return newRate; }
    public void setNewRate(BigDecimal newRate) { this.newRate = newRate; }
    public UUID getChangedBy() { return changedBy; }
    public void setChangedBy(UUID changedBy) { this.changedBy = changedBy; }
    public Instant getChangedAt() { return changedAt; }
    public void setChangedAt(Instant changedAt) { this.changedAt = changedAt; }
    public String getChangeReason() { return changeReason; }
    public void setChangeReason(String changeReason) { this.changeReason = changeReason; }
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
}
