package mls.sho.dms.entity.inventory;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

import java.math.BigDecimal;

/**
 * A single ingredient line on a Purchase Order.
 * receivedQty may differ from orderedQty when a supplier delivers a partial order.
 */
@Entity
@Table(
    name = "purchase_order_line",
    indexes = {
        @Index(name = "idx_po_line_order",      columnList = "purchase_order_id"),
        @Index(name = "idx_po_line_ingredient",  columnList = "ingredient_id")
    }
)
public class PurchaseOrderLine extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private RawIngredient ingredient;

    @Column(name = "ordered_qty", nullable = false, precision = 12, scale = 4)
    private BigDecimal orderedQty;

    @Column(name = "received_qty", precision = 12, scale = 4)
    private BigDecimal receivedQty;

    /** Expected PO unit cost. */
    @Column(name = "unit_cost", nullable = false, precision = 10, scale = 4)
    private BigDecimal unitCost;

    /** Actual invoice unit cost — used to update RawIngredient.costPerUnit on receipt. */
    @Column(name = "invoice_unit_price", precision = 10, scale = 4)
    private BigDecimal invoiceUnitPrice;

    public PurchaseOrder getPurchaseOrder() { return purchaseOrder; }
    public void setPurchaseOrder(PurchaseOrder po) { this.purchaseOrder = po; }
    public RawIngredient getIngredient() { return ingredient; }
    public void setIngredient(RawIngredient ingredient) { this.ingredient = ingredient; }
    public BigDecimal getOrderedQty() { return orderedQty; }
    public void setOrderedQty(BigDecimal orderedQty) { this.orderedQty = orderedQty; }
    public BigDecimal getReceivedQty() { return receivedQty; }
    public void setReceivedQty(BigDecimal receivedQty) { this.receivedQty = receivedQty; }
    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }
    public BigDecimal getInvoiceUnitPrice() { return invoiceUnitPrice; }
    public void setInvoiceUnitPrice(BigDecimal invoiceUnitPrice) { this.invoiceUnitPrice = invoiceUnitPrice; }
}
