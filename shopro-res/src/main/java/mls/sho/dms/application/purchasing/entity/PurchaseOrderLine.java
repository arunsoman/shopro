package mls.sho.dms.application.purchasing.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import mls.sho.dms.application.inventory.entity.Ingredient;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Line item record for a Purchase Order.
 * Linked to a specific Ingredient and Purchase Order header.
 * Also serves as the line item for GoodsReceipt and PurchaseInvoice
 * (cascading from PO).
 */
@Entity
@Table(name = "purchase_order_line")
@Data
public class PurchaseOrderLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    @JsonIgnore
    private PurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @Column(name = "ordered_qty", nullable = false, precision = 12, scale = 3)
    private BigDecimal orderedQty;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 4)
    private BigDecimal unitPrice;

    @Column(name = "received_qty", nullable = false, precision = 12, scale = 3)
    private BigDecimal receivedQty = BigDecimal.ZERO;

    // Conflict tracking fields (moved from GoodsReceiptLine)
    @Column(name = "has_conflict", nullable = false)
    private boolean hasConflict = false;

    @Column(name = "conflict_reason", columnDefinition = "TEXT")
    private String conflictReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    /**
     * Calculate line total (orderedQty * unitPrice)
     */
    public BigDecimal getLineTotal() {
        if (orderedQty == null || unitPrice == null) return BigDecimal.ZERO;
        return orderedQty.multiply(unitPrice);
    }

    /**
     * Calculate received total (receivedQty * unitPrice)
     */
    public BigDecimal getReceivedTotal() {
        if (receivedQty == null || unitPrice == null) return BigDecimal.ZERO;
        return receivedQty.multiply(unitPrice);
    }
}
