package mls.sho.dms.entity.inventory;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import mls.sho.dms.entity.staff.StaffMember;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * A Purchase Order sent to a supplier for ingredient replenishment.
 *
 * Indexes:
 *   - Composite on (supplier_id, status): frequent query when managers review pending POs.
 *   - idx_po_generated_time: order history sorted by creation time.
 */
@Entity
@Table(
    name = "purchase_order",
    indexes = {
        @Index(name = "idx_po_supplier_status", columnList = "supplier_id, status"),
        @Index(name = "idx_po_generated_time",  columnList = "created_at")
    }
)
public class PurchaseOrder extends BaseEntity {

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseOrderLine> lines = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "generated_by_id", nullable = false)
    private StaffMember generatedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PurchaseOrderStatus status = PurchaseOrderStatus.DRAFT;

    @Column(name = "total_value", nullable = false, precision = 12, scale = 4)
    private java.math.BigDecimal totalValue = java.math.BigDecimal.ZERO;

    @Column(name = "expected_delivery_date")
    private java.time.LocalDate expectedDeliveryDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_id")
    private StaffMember approvedBy;

    @Column(name = "approved_at")
    private Instant approvedAt;

    /** Timestamp when the PO email was dispatched to the supplier. Null = not yet sent. */
    @Column(name = "sent_at")
    private Instant sentAt;

    /** Timestamp when the Manager marked the delivery as received. */
    @Column(name = "received_at")
    private Instant receivedAt;

    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }
    public StaffMember getGeneratedBy() { return generatedBy; }
    public void setGeneratedBy(StaffMember generatedBy) { this.generatedBy = generatedBy; }
    public PurchaseOrderStatus getStatus() { return status; }
    public void setStatus(PurchaseOrderStatus status) { this.status = status; }
    public java.math.BigDecimal getTotalValue() { return totalValue; }
    public void setTotalValue(java.math.BigDecimal totalValue) { this.totalValue = totalValue; }
    public java.time.LocalDate getExpectedDeliveryDate() { return expectedDeliveryDate; }
    public void setExpectedDeliveryDate(java.time.LocalDate expectedDeliveryDate) { this.expectedDeliveryDate = expectedDeliveryDate; }
    public StaffMember getApprovedBy() { return approvedBy; }
    public void setApprovedBy(StaffMember approvedBy) { this.approvedBy = approvedBy; }
    public Instant getApprovedAt() { return approvedAt; }
    public void setApprovedAt(Instant approvedAt) { this.approvedAt = approvedAt; }
    public Instant getSentAt() { return sentAt; }
    public void setSentAt(Instant sentAt) { this.sentAt = sentAt; }
    public Instant getReceivedAt() { return receivedAt; }
    public void setReceivedAt(Instant receivedAt) { this.receivedAt = receivedAt; }

    public List<PurchaseOrderLine> getLines() { return lines; }
    public void setLines(List<PurchaseOrderLine> lines) { this.lines = lines; }
}
