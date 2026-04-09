package mls.sho.dms.entity.inventory;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

import java.math.BigDecimal;

/**
 * A single line item on a Vendor Invoice.
 */
@Entity
@Table(
    name = "vendor_invoice_line",
    indexes = {
        @Index(name = "idx_invoice_line_invoice", columnList = "vendor_invoice_id"),
        @Index(name = "idx_invoice_line_ingredient", columnList = "ingredient_id")
    }
)
public class VendorInvoiceLine extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendor_invoice_id", nullable = false)
    private VendorInvoice vendorInvoice;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private RawIngredient ingredient;

    @Column(name = "invoiced_qty", nullable = false, precision = 12, scale = 4)
    private BigDecimal invoicedQty;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 4)
    private BigDecimal unitPrice;

    public VendorInvoice getVendorInvoice() { return vendorInvoice; }
    public void setVendorInvoice(VendorInvoice vendorInvoice) { this.vendorInvoice = vendorInvoice; }
    public RawIngredient getIngredient() { return ingredient; }
    public void setIngredient(RawIngredient ingredient) { this.ingredient = ingredient; }
    public BigDecimal getInvoicedQty() { return invoicedQty; }
    public void setInvoicedQty(BigDecimal invoicedQty) { this.invoicedQty = invoicedQty; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
}
