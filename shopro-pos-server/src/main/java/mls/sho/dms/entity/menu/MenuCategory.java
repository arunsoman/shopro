package mls.sho.dms.entity.menu;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

/**
 * Represents a top-level menu category (e.g., Appetizers, Mains, Cocktails).
 * Categories control POS grid navigation grouping.
 *
 * Indexes:
 *   - UNIQUE on name — category names must be globally unique.
 *   - idx_category_display_order — for fast ordered listing.
 */
@Entity
@Table(
    name = "menu_category",
    indexes = {
        @Index(name = "uq_category_name",         columnList = "name",          unique = true),
        @Index(name = "idx_category_display_order", columnList = "display_order")
    }
)
public class MenuCategory extends BaseEntity {

    @Column(name = "name", nullable = false, length = 40)
    private String name;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(name = "default_course", nullable = false)
    private Integer defaultCourse = 1;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public Integer getDefaultCourse() { return defaultCourse; }
    public void setDefaultCourse(Integer defaultCourse) { this.defaultCourse = defaultCourse; }
}
