package mls.sho.dms.entity.inventory;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Request For Quotation generated automatically when autoReplenish ingredients breach reorder thresholds.
 */
@Entity
@Table(
    name = "rfq",
    indexes = {
        @Index(name = "idx_rfq_ingredient", columnList = "ingredient_id"),
        @Index(name = "idx_rfq_status", columnList = "status")
    }
)
public class RFQ extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private RawIngredient ingredient;

    @Column(name = "required_qty", nullable = false, precision = 12, scale = 4)
    private BigDecimal requiredQty;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private RfqStatus status = RfqStatus.OPEN;

    @Column(name = "desired_delivery_date", nullable = false)
    private java.time.LocalDate desiredDeliveryDate;

    @Column(name = "bid_deadline", nullable = false)
    private Instant bidDeadline;

    public RawIngredient getIngredient() { return ingredient; }
    public void setIngredient(RawIngredient ingredient) { this.ingredient = ingredient; }
    public BigDecimal getRequiredQty() { return requiredQty; }
    public void setRequiredQty(BigDecimal requiredQty) { this.requiredQty = requiredQty; }
    public RfqStatus getStatus() { return status; }
    public void setStatus(RfqStatus status) { this.status = status; }
    public java.time.LocalDate getDesiredDeliveryDate() { return desiredDeliveryDate; }
    public void setDesiredDeliveryDate(java.time.LocalDate desiredDeliveryDate) { this.desiredDeliveryDate = desiredDeliveryDate; }
    public Instant getBidDeadline() { return bidDeadline; }
    public void setBidDeadline(Instant bidDeadline) { this.bidDeadline = bidDeadline; }
}
