package mls.sho.dms.entity.menu;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

import java.math.BigDecimal;

/**
 * A single selectable option within a ModifierGroup (e.g., "Rare", "Extra Cheese +$1.50").
 * upchargeAmount of ZERO means the option is free.
 */
@Entity
@Table(
    name = "modifier_option",
    indexes = {
        @Index(name = "idx_modifier_option_group", columnList = "modifier_group_id")
    }
)
public class ModifierOption extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "modifier_group_id", nullable = false)
    private ModifierGroup modifierGroup;

    @Column(name = "label", nullable = false, length = 80)
    private String label;

    /** Additional charge in dollars for selecting this option. Default 0.00 (no extra charge). */
    @Column(name = "upcharge_amount", nullable = false, precision = 8, scale = 2)
    private BigDecimal upchargeAmount = BigDecimal.ZERO;

    /** Display sort position within the group. */
    @Column(name = "display_order", nullable = false)
    private int displayOrder = 0;

    public ModifierGroup getModifierGroup() { return modifierGroup; }
    public void setModifierGroup(ModifierGroup modifierGroup) { this.modifierGroup = modifierGroup; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public BigDecimal getUpchargeAmount() { return upchargeAmount; }
    public void setUpchargeAmount(BigDecimal upchargeAmount) { this.upchargeAmount = upchargeAmount; }

    public int getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(int displayOrder) { this.displayOrder = displayOrder; }
}
