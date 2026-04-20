package mls.sho.dms.entity;

import jakarta.persistence.*;
import lombok.Data;
import mls.sho.dms.application.inventory.entity.Ingredient;

import java.math.BigDecimal;

@Entity
@Table(name = "recipe_ingredient_line")
@Data
public class RecipeIngredientLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @Column(name = "line_number", nullable = false)
    private Integer lineNumber;

    @Column(name = "quantity_ru", nullable = false, precision = 10, scale = 4)
    private BigDecimal quantityRu;

    @Enumerated(EnumType.STRING)
    @Column(name = "recipe_unit", nullable = false)
    private mls.sho.dms.common.enums.RecipeUnit recipeUnit;

    @Transient
    public BigDecimal getRuCost() {
        if (ingredient == null) return BigDecimal.ZERO;
        return ingredient.getPurchaseUnitPrice()
                .divide(ingredient.getRuPerPu(), 4, java.math.RoundingMode.HALF_UP)
                .divide(ingredient.getYieldPct(), 4, java.math.RoundingMode.HALF_UP);
    }

    @Transient
    public BigDecimal getExtension() {
        BigDecimal cost = getRuCost();
        if (cost == null || quantityRu == null) return BigDecimal.ZERO;
        return quantityRu.multiply(cost);
    }
}
