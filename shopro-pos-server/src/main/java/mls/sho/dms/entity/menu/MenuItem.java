package mls.sho.dms.entity.menu;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

import java.math.BigDecimal;

/**
 * Represents a single item on the restaurant's menu.
 *
 * PostgreSQL strategy:
 *   - Partial index on status = 'PUBLISHED': POS and Tableside only ever query
 *     published items — this index makes grid loads extremely fast.
 *   - Composite index on (category_id, status): supports category-filtered grid requests.
 *   - photo_url stores a CDN path only; binary data is never stored in the DB.
 */
@Entity
@Table(
    name = "menu_item",
    indexes = {
        @Index(name = "idx_item_published",          columnList = "status"),
        @Index(name = "idx_item_category_status",    columnList = "category_id, status"),
        @Index(name = "idx_item_name_search",         columnList = "name")  // supports typeahead ILIKE
    }
)
public class MenuItem extends BaseEntity {

    @Column(name = "name", nullable = false, length = 60)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    /**
     * Base price before any modifier upcharges. Never null — must be set before publishing.
     * Precision 10, scale 2 supports up to $99,999,999.99.
     */
    @Column(name = "base_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    /** CDN URL to the item's display photo. Nullable — item can exist without a photo. */
    @Column(name = "photo_url", length = 1024)
    private String photoUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private MenuItemStatus status = MenuItemStatus.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private MenuCategory category;

    @OneToMany(mappedBy = "menuItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private java.util.List<MenuItemModifierGroup> modifierGroups = new java.util.ArrayList<>();

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public MenuItemStatus getStatus() { return status; }
    public void setStatus(MenuItemStatus status) { this.status = status; }

    public MenuCategory getCategory() { return category; }
    public void setCategory(MenuCategory category) { this.category = category; }

    public java.util.List<MenuItemModifierGroup> getModifierGroups() { return modifierGroups; }
    
    public void addModifierGroup(MenuItemModifierGroup group) {
        modifierGroups.add(group);
        group.setMenuItem(this);
    }

    public void removeModifierGroup(MenuItemModifierGroup group) {
        modifierGroups.remove(group);
        group.setMenuItem(null);
    }
}
