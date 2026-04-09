package mls.sho.dms.entity.inventory.recipe;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import mls.sho.dms.entity.core.BaseEntity;
import mls.sho.dms.entity.inventory.menu.MenuItem;
import mls.sho.dms.entity.staff.StaffMember;

import java.time.Instant;
import java.util.Set;

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
@Getter
@Setter
public class Recipe extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id")
    private MenuItem menuItem;

    private Set<SubRecipe> subRecipes;

    @Column(name = "recipe_version", nullable = false)
    private int recipeVersion;

    /** Timestamp from which this recipe version is the active depletion formula. */
    @Column(name = "effective_from", nullable = false)
    private Instant effectiveFrom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private StaffMember createdBy;

    private Set<RecipeIngredientLine> recipeIngredientLines;
}
