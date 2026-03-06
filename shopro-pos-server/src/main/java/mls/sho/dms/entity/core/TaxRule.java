package mls.sho.dms.entity.core;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.math.BigDecimal;

/**
 * TaxRule defines configurable taxes to be applied to items.
 * Specifically required for UAE 5% VAT compliance among others.
 */
@Entity
@Table(name = "tax_rule")
public class TaxRule extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal percentage;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "is_inclusive", nullable = false)
    private boolean isInclusive = false;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public BigDecimal getPercentage() { return percentage; }
    public void setPercentage(BigDecimal percentage) { this.percentage = percentage; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    public boolean isInclusive() { return isInclusive; }
    public void setInclusive(boolean inclusive) { isInclusive = inclusive; }
}
