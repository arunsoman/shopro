package mls.sho.dms.entity.inventory;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import mls.sho.dms.entity.staff.StaffMember;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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
    @Column(name = "status", nullable = false, length = 30)
    private PurchaseOrderStatus status = PurchaseOrderStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type", nullable = false, length = 20)
    private OrderType orderType = OrderType.STANDARD;

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

    @Column(name = "tracking_number", length = 100)
    private String trackingNumber;

    @Column(name = "invoice_file_id")
    private UUID invoiceFileId;

    @Column(name = "delivery_note_ref", length = 100)
    private String deliveryNoteRef;

    @Column(name = "shipped_at")
    private Instant shippedAt;

    @Column(name = "source_bid_id")
    private UUID sourceBidId;

    @Column(name = "source_proposal_id")
    private UUID sourceProposalId;

    @Column(name = "counter_offer_price", precision = 12, scale = 4)
    private java.math.BigDecimal counterOfferPrice;

    @Column(name = "counter_offer_qty", precision = 12, scale = 4)
    private java.math.BigDecimal counterOfferQty;

    @Column(name = "counter_offer_date")
    private Instant counterOfferDate;

    @Column(name = "counter_offer_notes", columnDefinition = "TEXT")
    private String counterOfferNotes;

    @Column(name = "acknowledged_at")
    private Instant acknowledgedAt;

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

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
    public UUID getInvoiceFileId() { return invoiceFileId; }
    public void setInvoiceFileId(UUID invoiceFileId) { this.invoiceFileId = invoiceFileId; }
    public String getDeliveryNoteRef() { return deliveryNoteRef; }
    public void setDeliveryNoteRef(String deliveryNoteRef) { this.deliveryNoteRef = deliveryNoteRef; }
    public Instant getShippedAt() { return shippedAt; }
    public void setShippedAt(Instant shippedAt) { this.shippedAt = shippedAt; }

    public UUID getSourceBidId() { return sourceBidId; }
    public void setSourceBidId(UUID sourceBidId) { this.sourceBidId = sourceBidId; }
    public UUID getSourceProposalId() { return sourceProposalId; }
    public void setSourceProposalId(UUID sourceProposalId) { this.sourceProposalId = sourceProposalId; }
    public java.math.BigDecimal getCounterOfferPrice() { return counterOfferPrice; }
    public void setCounterOfferPrice(java.math.BigDecimal counterOfferPrice) { this.counterOfferPrice = counterOfferPrice; }
    public java.math.BigDecimal getCounterOfferQty() { return counterOfferQty; }
    public void setCounterOfferQty(java.math.BigDecimal counterOfferQty) { this.counterOfferQty = counterOfferQty; }
    public Instant getCounterOfferDate() { return counterOfferDate; }
    public void setCounterOfferDate(Instant counterOfferDate) { this.counterOfferDate = counterOfferDate; }
    public String getCounterOfferNotes() { return counterOfferNotes; }
    public void setCounterOfferNotes(String counterOfferNotes) { this.counterOfferNotes = counterOfferNotes; }
    public Instant getAcknowledgedAt() { return acknowledgedAt; }
    public void setAcknowledgedAt(Instant acknowledgedAt) { this.acknowledgedAt = acknowledgedAt; }
}
