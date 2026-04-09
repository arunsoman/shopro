package mls.sho.dms.entity.inventory.recipe;

import jakarta.persistence.*;
import lombok.*;
import mls.sho.dms.entity.inventory.ingredient.RawIngredient;
import java.util.UUID;

@Entity
@Table(name = "mgt_recipe_ingredient_lines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipeIngredientLine {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id")
    private RawIngredient ingredient;

    @Column(nullable = false)
    private Double quantity;

    @Column(nullable = false)
    private String unit; // Typically RU: GAL, LB, etc.

    public Double calculateLineCost() {
        if (ingredient != null) {
            // Raw Ingredient cost is (PU Cost / RU per PU) / Yield %
            // calculateLineCost should multiplier by quantity
            return ingredient.getCostPerUnit().multiply(quantity);
        } else if (subRecipe != null) {
            // Sub Recipe cost is its total cost / yield * quantity
            return subRecipe.calculateCostPerYieldUnit() * quantity;
        }
        return 0.0;
    }
}
