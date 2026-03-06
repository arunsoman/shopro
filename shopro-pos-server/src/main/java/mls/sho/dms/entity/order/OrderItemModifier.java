package mls.sho.dms.entity.order;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import mls.sho.dms.entity.menu.ModifierOption;

import java.math.BigDecimal;

/**
 * Records a single modifier option selected for an OrderItem.
 * upchargeAmount is captured at order time — immutable snapshot of ModifierOption.upchargeAmount.
 */
@Entity
@Table(
    name = "order_item_modifier",
    indexes = {
        @Index(name = "idx_order_item_modifier_item", columnList = "order_item_id")
    }
)
public class OrderItemModifier extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_item_id", nullable = false)
    private OrderItem orderItem;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "modifier_option_id", nullable = false)
    private ModifierOption modifierOption;

    /** Upcharge captured at order time — never recalculated from ModifierOption. */
    @Column(name = "upcharge_amount", nullable = false, precision = 8, scale = 2)
    private BigDecimal upchargeAmount = BigDecimal.ZERO;

    public OrderItem getOrderItem() { return orderItem; }
    public void setOrderItem(OrderItem orderItem) { this.orderItem = orderItem; }
    public ModifierOption getModifierOption() { return modifierOption; }
    public void setModifierOption(ModifierOption modifierOption) { this.modifierOption = modifierOption; }
    public BigDecimal getUpchargeAmount() { return upchargeAmount; }
    public void setUpchargeAmount(BigDecimal upchargeAmount) { this.upchargeAmount = upchargeAmount; }
}
