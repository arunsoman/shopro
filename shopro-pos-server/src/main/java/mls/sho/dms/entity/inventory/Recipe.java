package mls.sho.dms.entity.inventory;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;
import mls.sho.dms.entity.menu.MenuItem;
import mls.sho.dms.entity.staff.StaffMember;

import java.time.Instant;

/**
 * An immutable, versioned snapshot of ingredient quantities for a menu item.
 * Recipes are append-only — never modified after creation. When a recipe changes,
 * a new Recipe row is created with an incremented version and effectiveFrom timestamp.
 *
 * This design preserves food cost history for all past orders.
 *
 * Unique constraint on (menu_item_id, version): ensures no duplicate versions per item.
 */
@Entity
@Table(
    name = "recipe",
    indexes = {
        @Index(name = "idx_recipe_menu_item",   columnList = "menu_item_id, effective_from"),
        @Index(name = "idx_recipe_sub_recipe",  columnList = "sub_recipe_id, effective_from")
    }
)
public class Recipe extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id")
    private MenuItem menuItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_recipe_id")
    private SubRecipe subRecipe;

    @Column(name = "recipe_version", nullable = false)
    private int recipeVersion;

    /** Timestamp from which this recipe version is the active depletion formula. */
    @Column(name = "effective_from", nullable = false)
    private Instant effectiveFrom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private StaffMember createdBy;

    public MenuItem getMenuItem() { return menuItem; }
    public void setMenuItem(MenuItem menuItem) { this.menuItem = menuItem; }
    public SubRecipe getSubRecipe() { return subRecipe; }
    public void setSubRecipe(SubRecipe subRecipe) { this.subRecipe = subRecipe; }
    public int getRecipeVersion() { return recipeVersion; }
    public void setRecipeVersion(int recipeVersion) { this.recipeVersion = recipeVersion; }
    public Instant getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(Instant effectiveFrom) { this.effectiveFrom = effectiveFrom; }
    public StaffMember getCreatedBy() { return createdBy; }
    public void setCreatedBy(StaffMember createdBy) { this.createdBy = createdBy; }
}
