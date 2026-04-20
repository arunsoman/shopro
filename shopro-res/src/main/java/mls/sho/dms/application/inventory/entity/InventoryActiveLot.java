package mls.sho.dms.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Manages the live "FIFO Pool" for a specific ingredient. 
 * Groups physical stock by its arrival/prep date to track costs and expiry.
 */
@Entity
@Table(name = "inventory_active_lot")
@Data
public class InventoryActiveLot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grn_id")
    private GoodsReceipt goodsReceipt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(name = "lot_number")
    private String lotNumber;

    @Column(name = "received_at", nullable = false)
    private LocalDateTime receivedAt = LocalDateTime.now();

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    // -- Quantities (Stored in Standard Base Unit) --
    @Column(name = "initial_qty", nullable = false, precision = 12, scale = 4)
    private BigDecimal initialQty;

    @Column(name = "available_qty", nullable = false, precision = 12, scale = 4)
    private BigDecimal availableQty;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 4)
    private BigDecimal unitPrice;

    @Column(name = "tax_amount", precision = 12, scale = 4)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        // Automatically deactivate lot when exhausted
        if (availableQty != null && availableQty.compareTo(BigDecimal.ZERO) <= 0) {
            active = false;
        }
    }
}
