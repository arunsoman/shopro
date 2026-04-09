package mls.sho.dms.tax.entity;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * Stores venue-specific overrides for tax rules (e.g., custom local rates within legal bounds).
 */
@Entity
@Table(name = "venue_tax_configs", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"venue_id", "tax_rule_id"})
})
public class VenueTaxConfig extends BaseEntity {

    @Column(name = "venue_id", nullable = false)
    private UUID venueId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tax_rule_id", nullable = false)
    private TaxRule taxRule;

    @Column(name = "override_rate", nullable = false, precision = 6, scale = 4)
    private BigDecimal overrideRate;

    @Column(name = "override_reason", columnDefinition = "TEXT")
    private String overrideReason;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    public UUID getVenueId() { return venueId; }
    public void setVenueId(UUID venueId) { this.venueId = venueId; }
    public TaxRule getTaxRule() { return taxRule; }
    public void setTaxRule(TaxRule taxRule) { this.taxRule = taxRule; }
    public BigDecimal getOverrideRate() { return overrideRate; }
    public void setOverrideRate(BigDecimal overrideRate) { this.overrideRate = overrideRate; }
    public String getOverrideReason() { return overrideReason; }
    public void setOverrideReason(String overrideReason) { this.overrideReason = overrideReason; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }
}
