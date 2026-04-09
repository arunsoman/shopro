package mls.sho.dms.entity.inventory;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import mls.sho.dms.entity.staff.StaffMember;

import java.time.Instant;

/**
 * Represents the Goods Receipt Note (GRN) created when a delivery arrives.
 * Used in the 3-Way Match process against PurchaseOrder and VendorInvoice.
 */
@Entity
@Table(
    name = "goods_receipt_note",
    indexes = {
        @Index(name = "idx_grn_po", columnList = "purchase_order_id")
    }
)
public class GoodsReceiptNote extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrder purchaseOrder;

    @Column(name = "received_at", nullable = false)
    private Instant receivedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "received_by_id", nullable = false)
    private StaffMember receivedBy;

    @Column(name = "delivery_note_reference", length = 100)
    private String deliveryNoteReference;

    @Column(name = "notes", length = 500)
    private String notes;

    public PurchaseOrder getPurchaseOrder() { return purchaseOrder; }
    public void setPurchaseOrder(PurchaseOrder purchaseOrder) { this.purchaseOrder = purchaseOrder; }
    public Instant getReceivedAt() { return receivedAt; }
    public void setReceivedAt(Instant receivedAt) { this.receivedAt = receivedAt; }
    public StaffMember getReceivedBy() { return receivedBy; }
    public void setReceivedBy(StaffMember receivedBy) { this.receivedBy = receivedBy; }
    public String getDeliveryNoteReference() { return deliveryNoteReference; }
    public void setDeliveryNoteReference(String deliveryNoteReference) { this.deliveryNoteReference = deliveryNoteReference; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
