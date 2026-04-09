package mls.sho.dms.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Line item record for a Goods Receipt Note.
 * Tracks specific ingredients delivered.
 */
@Entity
@Table(name = "goods_receipt_line")
@Data
public class GoodsReceiptLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goods_receipt_id", nullable = false)
    @JsonIgnore
    private GoodsReceipt goodsReceipt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @Column(name = "received_qty", nullable = false, precision = 12, scale = 4)
    private BigDecimal receivedQty = BigDecimal.ZERO;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 4)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(name = "has_conflict", nullable = false)
    private boolean hasConflict = false;

    @Column(name = "conflict_reason", columnDefinition = "TEXT")
    private String conflictReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
