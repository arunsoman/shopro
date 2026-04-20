package mls.sho.dms.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import mls.sho.dms.application.purchasing.entity.PurchaseOrder;
import mls.sho.dms.application.purchasing.entity.PurchaseOrderLine;
import mls.sho.dms.application.purchasing.entity.Supplier;
import mls.sho.dms.common.enums.GoodsReceiptStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Goods Receipt Note (GRN) Header record.
 * Represents a delivery received at the restaurant.
 * Lines are derived from the linked PurchaseOrder.
 */
@Entity
@Table(name = "goods_receipt")
@Data
public class GoodsReceipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    @JsonIgnore
    private Restaurant restaurant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id")
    private PurchaseOrder purchaseOrder;

    @Column(name = "received_date", nullable = false)
    private LocalDateTime receivedDate = LocalDateTime.now();

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GoodsReceiptStatus status = GoodsReceiptStatus.DRAFT;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    /**
     * Get lines from the linked PurchaseOrder.
     * Returns empty list if no PO is linked.
     */
    public List<PurchaseOrderLine> getLines() {
        if (purchaseOrder == null || purchaseOrder.getLines() == null) {
            return new ArrayList<>();
        }
        return purchaseOrder.getLines();
    }

    /**
     * Calculate total from PO lines (receivedQty * unitPrice).
     */
    public void calculateTotal() {
        this.totalAmount = getLines().stream()
                .map(line -> {
                    BigDecimal received = line.getReceivedQty() != null ? line.getReceivedQty() : BigDecimal.ZERO;
                    BigDecimal price = line.getUnitPrice() != null ? line.getUnitPrice() : BigDecimal.ZERO;
                    return received.multiply(price);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Get lines with non-zero received quantity (for display in GRN).
     */
    public List<PurchaseOrderLine> getReceivedLines() {
        return getLines().stream()
                .filter(line -> line.getReceivedQty() != null && line.getReceivedQty().compareTo(BigDecimal.ZERO) > 0)
                .collect(Collectors.toList());
    }
}
