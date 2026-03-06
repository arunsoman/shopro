package mls.sho.dms.entity.inventory;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Represents the Vendor's Invoice against a Purchase Order.
 * Used in the 3-Way Match process against PurchaseOrder and GoodsReceiptNote.
 */
@Entity
@Table(
    name = "vendor_invoice",
    indexes = {
        @Index(name = "idx_vendor_invoice_po", columnList = "purchase_order_id"),
        @Index(name = "uq_vendor_invoice_number", columnList = "invoice_number", unique = true)
    }
)
public class VendorInvoice extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrder purchaseOrder;

    @Column(name = "invoice_number", nullable = false, length = 100)
    private String invoiceNumber;

    @Column(name = "invoice_date", nullable = false)
    private java.time.LocalDate invoiceDate;

    @Column(name = "uploaded_at", nullable = false)
    private Instant uploadedAt;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 4)
    private BigDecimal totalAmount;

    @Column(name = "tax_amount", precision = 12, scale = 4)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    public PurchaseOrder getPurchaseOrder() { return purchaseOrder; }
    public void setPurchaseOrder(PurchaseOrder purchaseOrder) { this.purchaseOrder = purchaseOrder; }
    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
    public java.time.LocalDate getInvoiceDate() { return invoiceDate; }
    public void setInvoiceDate(java.time.LocalDate invoiceDate) { this.invoiceDate = invoiceDate; }
    public Instant getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(Instant uploadedAt) { this.uploadedAt = uploadedAt; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
}
