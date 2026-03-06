package mls.sho.dms.entity.inventory;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

import java.math.BigDecimal;

/**
 * One ingredient line in a Recipe.
 * quantity is the raw amount needed BEFORE applying yield (application layer applies yield).
 */
@Entity
@Table(
    name = "recipe_ingredient",
    indexes = {
        @Index(name = "idx_recipe_ingredient_recipe",     columnList = "recipe_id"),
        @Index(name = "idx_recipe_ingredient_ingredient", columnList = "ingredient_id"),
        @Index(name = "idx_recipe_ingredient_sub_recipe", columnList = "sub_recipe_id")
    }
)
public class RecipeIngredient extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id")
    private RawIngredient ingredient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_recipe_id")
    private SubRecipe subRecipe;

    /** Quantity of the ingredient needed for one serving, in the ingredient's unit_of_measure. */
    @Column(name = "quantity", nullable = false, precision = 10, scale = 4)
    private BigDecimal quantity;

    public Recipe getRecipe() { return recipe; }
    public void setRecipe(Recipe recipe) { this.recipe = recipe; }
    public RawIngredient getIngredient() { return ingredient; }
    public void setIngredient(RawIngredient ingredient) { this.ingredient = ingredient; }
    public SubRecipe getSubRecipe() { return subRecipe; }
    public void setSubRecipe(SubRecipe subRecipe) { this.subRecipe = subRecipe; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
}
