package mls.sho.dms.entity.crm;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import mls.sho.dms.entity.core.BaseEntity;

import java.math.BigDecimal;

/**
 * Defines a tier in the loyalty program (e.g., Bronze, Silver, Gold).
 */
@Entity
@Table(name = "loyalty_tier")
public class LoyaltyTier extends BaseEntity {

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "spend_threshold", nullable = false, precision = 12, scale = 2)
    private BigDecimal spendThreshold = BigDecimal.ZERO;

    @Column(name = "point_multiplier", nullable = false, precision = 4, scale = 2)
    private BigDecimal pointMultiplier = BigDecimal.ONE;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public BigDecimal getSpendThreshold() { return spendThreshold; }
    public void setSpendThreshold(BigDecimal spendThreshold) { this.spendThreshold = spendThreshold; }
    public BigDecimal getPointMultiplier() { return pointMultiplier; }
    public void setPointMultiplier(BigDecimal pointMultiplier) { this.pointMultiplier = pointMultiplier; }
}
