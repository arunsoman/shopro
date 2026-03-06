package mls.sho.dms.entity.inventory;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

import java.math.BigDecimal;

/**
 * A bid submitted by a Supplier against an active RFQ.
 */
@Entity
@Table(
    name = "vendor_bid",
    indexes = {
        @Index(name = "idx_vendor_bid_rfq", columnList = "rfq_id"),
        @Index(name = "idx_vendor_bid_supplier", columnList = "supplier_id")
    }
)
public class VendorBid extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rfq_id", nullable = false)
    private RFQ rfq;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 4)
    private BigDecimal unitPrice;

    @Column(name = "quantity_available", nullable = false, precision = 12, scale = 4)
    private BigDecimal quantityAvailable;

    @Column(name = "delivery_date", nullable = false)
    private java.time.LocalDate deliveryDate;

    @Column(name = "payment_terms", length = 100)
    private String paymentTerms;

    @Column(name = "notes", length = 500)
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private VendorBidStatus status = VendorBidStatus.SUBMITTED;

    public RFQ getRfq() { return rfq; }
    public void setRfq(RFQ rfq) { this.rfq = rfq; }
    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public BigDecimal getQuantityAvailable() { return quantityAvailable; }
    public void setQuantityAvailable(BigDecimal quantityAvailable) { this.quantityAvailable = quantityAvailable; }
    public java.time.LocalDate getDeliveryDate() { return deliveryDate; }
    public void setDeliveryDate(java.time.LocalDate deliveryDate) { this.deliveryDate = deliveryDate; }
    public String getPaymentTerms() { return paymentTerms; }
    public void setPaymentTerms(String paymentTerms) { this.paymentTerms = paymentTerms; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public VendorBidStatus getStatus() { return status; }
    public void setStatus(VendorBidStatus status) { this.status = status; }
}
