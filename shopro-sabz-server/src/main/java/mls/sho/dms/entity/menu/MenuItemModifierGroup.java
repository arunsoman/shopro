package mls.sho.dms.entity.menu;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

/**
 * Join entity linking a MenuItem to its assigned ModifierGroups.
 * A single ModifierGroup can be shared across many MenuItems (e.g., "Sauce Choice" on multiple items).
 *
 * Unique constraint on (menu_item_id, modifier_group_id) prevents duplicate assignments.
 */
@Entity
@Table(
    name = "menu_item_modifier_group",
    indexes = {
        @Index(name = "uq_item_modifier_group", columnList = "menu_item_id, modifier_group_id", unique = true),
        @Index(name = "idx_item_modifier_item",  columnList = "menu_item_id")
    }
)
public class MenuItemModifierGroup extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "modifier_group_id", nullable = false)
    private ModifierGroup modifierGroup;

    /** Controls the display order of modifier groups on the item's modifier screen. */
    @Column(name = "display_order", nullable = false)
    private int displayOrder = 0;

    public MenuItem getMenuItem() { return menuItem; }
    public void setMenuItem(MenuItem menuItem) { this.menuItem = menuItem; }

    public ModifierGroup getModifierGroup() { return modifierGroup; }
    public void setModifierGroup(ModifierGroup modifierGroup) { this.modifierGroup = modifierGroup; }

    public int getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(int displayOrder) { this.displayOrder = displayOrder; }
}
