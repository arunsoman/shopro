package mls.sho.dms.entity.inventory;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import mls.sho.dms.entity.staff.StaffMember;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Log of a specific production batch for a SubRecipe. POS sales deplete from the oldest active BatchRecord.
 */
@Entity
@Table(
    name = "batch_record",
    indexes = {
        @Index(name = "idx_batch_subrecipe_status", columnList = "sub_recipe_id, status"),
        @Index(name = "idx_batch_expiry", columnList = "expiry_at")
    }
)
public class BatchRecord extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sub_recipe_id", nullable = false)
    private SubRecipe subRecipe;

    @Column(name = "produced_qty", nullable = false, precision = 12, scale = 4)
    private BigDecimal producedQty;

    @Column(name = "remaining_qty", nullable = false, precision = 12, scale = 4)
    private BigDecimal remainingQty;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private BatchStatus status = BatchStatus.ACTIVE;

    @Column(name = "produced_at", nullable = false)
    private Instant producedAt;

    @Column(name = "expiry_at")
    private Instant expiryAt;

    @Column(name = "notes", length = 500)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "produced_by_id", nullable = false)
    private StaffMember producedBy;

    public SubRecipe getSubRecipe() { return subRecipe; }
    public void setSubRecipe(SubRecipe subRecipe) { this.subRecipe = subRecipe; }
    public BigDecimal getProducedQty() { return producedQty; }
    public void setProducedQty(BigDecimal producedQty) { this.producedQty = producedQty; }
    public BigDecimal getRemainingQty() { return remainingQty; }
    public void setRemainingQty(BigDecimal remainingQty) { this.remainingQty = remainingQty; }
    public BatchStatus getStatus() { return status; }
    public void setStatus(BatchStatus status) { this.status = status; }
    public Instant getProducedAt() { return producedAt; }
    public void setProducedAt(Instant producedAt) { this.producedAt = producedAt; }
    public Instant getExpiryAt() { return expiryAt; }
    public void setExpiryAt(Instant expiryAt) { this.expiryAt = expiryAt; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public StaffMember getProducedBy() { return producedBy; }
    public void setProducedBy(StaffMember producedBy) { this.producedBy = producedBy; }
}
