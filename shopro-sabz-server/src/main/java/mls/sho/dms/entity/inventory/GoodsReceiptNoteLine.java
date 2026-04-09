package mls.sho.dms.entity.inventory;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

import java.math.BigDecimal;

/**
 * A single line item on a Goods Receipt Note.
 */
@Entity
@Table(
    name = "goods_receipt_note_line",
    indexes = {
        @Index(name = "idx_grn_line_grn", columnList = "goods_receipt_note_id"),
        @Index(name = "idx_grn_line_ingredient", columnList = "ingredient_id")
    }
)
public class GoodsReceiptNoteLine extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "goods_receipt_note_id", nullable = false)
    private GoodsReceiptNote goodsReceiptNote;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private RawIngredient ingredient;

    @Column(name = "received_qty", nullable = false, precision = 12, scale = 4)
    private BigDecimal receivedQty;

    @Column(name = "damaged_qty", precision = 12, scale = 4)
    private BigDecimal damagedQty = BigDecimal.ZERO;

    public GoodsReceiptNote getGoodsReceiptNote() { return goodsReceiptNote; }
    public void setGoodsReceiptNote(GoodsReceiptNote goodsReceiptNote) { this.goodsReceiptNote = goodsReceiptNote; }
    public RawIngredient getIngredient() { return ingredient; }
    public void setIngredient(RawIngredient ingredient) { this.ingredient = ingredient; }
    public BigDecimal getReceivedQty() { return receivedQty; }
    public void setReceivedQty(BigDecimal receivedQty) { this.receivedQty = receivedQty; }
    public BigDecimal getDamagedQty() { return damagedQty; }
    public void setDamagedQty(BigDecimal damagedQty) { this.damagedQty = damagedQty; }
}
