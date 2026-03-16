package mls.sho.dms.entity.inventory;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "inventory_batch",
    indexes = {
        @Index(name = "idx_batch_expiry", columnList = "expiry_date"),
        @Index(name = "idx_batch_status", columnList = "status")
    }
)
public class InventoryBatch extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private RawIngredient ingredient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private InventoryLocation location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(name = "batch_number", nullable = false, length = 50)
    private String batchNumber;

    @Column(name = "received_quantity", nullable = false, precision = 12, scale = 4)
    private BigDecimal receivedQuantity;

    @Column(name = "current_quantity", nullable = false, precision = 12, scale = 4)
    private BigDecimal currentQuantity;

    @Column(name = "cost_at_receipt", nullable = false, precision = 12, scale = 4)
    private BigDecimal costAtReceipt;

    @Column(name = "received_date")
    private Instant receivedDate;

    @Column(name = "expiry_date")
    private Instant expiryDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private BatchStatus status = BatchStatus.ACTIVE;

    public RawIngredient getIngredient() { return ingredient; }
    public void setIngredient(RawIngredient ingredient) { this.ingredient = ingredient; }
    public InventoryLocation getLocation() { return location; }
    public void setLocation(InventoryLocation location) { this.location = location; }
    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }
    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }
    public BigDecimal getReceivedQuantity() { return receivedQuantity; }
    public void setReceivedQuantity(BigDecimal receivedQuantity) { this.receivedQuantity = receivedQuantity; }
    public BigDecimal getCurrentQuantity() { return currentQuantity; }
    public void setCurrentQuantity(BigDecimal currentQuantity) { this.currentQuantity = currentQuantity; }
    public BigDecimal getCostAtReceipt() { return costAtReceipt; }
    public void setCostAtReceipt(BigDecimal costAtReceipt) { this.costAtReceipt = costAtReceipt; }
    public Instant getReceivedDate() { return receivedDate; }
    public void setReceivedDate(Instant receivedDate) { this.receivedDate = receivedDate; }
    public Instant getExpiryDate() { return expiryDate; }
    public void setExpiryDate(Instant expiryDate) { this.expiryDate = expiryDate; }
    public BatchStatus getStatus() { return status; }
    public void setStatus(BatchStatus status) { this.status = status; }
}
