package mls.sho.dms.tax.entity;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import java.util.UUID;

/**
 * Categorizes menu items for taxation purposes (e.g., temperature-based VAT).
 */
@Entity
@Table(name = "item_tax_tags")
public class ItemTaxTag extends BaseEntity {

    @Column(name = "menu_item_id", nullable = false, unique = true)
    private UUID menuItemId;

    @Column(name = "temperature", length = 10)
    private String temperature; // HOT, COLD

    @Column(name = "item_category", nullable = false, length = 50)
    private String itemCategory; // FOOD, BEVERAGE, ALCOHOL, TOBACCO

    @Column(name = "is_basic_staple", nullable = false)
    private boolean basicStaple = false;

    public UUID getMenuItemId() { return menuItemId; }
    public void setMenuItemId(UUID menuItemId) { this.menuItemId = menuItemId; }
    public String getTemperature() { return temperature; }
    public void setTemperature(String temperature) { this.temperature = temperature; }
    public String getItemCategory() { return itemCategory; }
    public void setItemCategory(String itemCategory) { this.itemCategory = itemCategory; }
    public boolean isBasicStaple() { return basicStaple; }
    public void setBasicStaple(boolean basicStaple) { this.basicStaple = basicStaple; }
}
