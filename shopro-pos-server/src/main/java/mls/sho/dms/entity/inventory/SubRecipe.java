package mls.sho.dms.entity.inventory;

import jakarta.persistence.*;
import mls.sho.dms.entity.core.BaseEntity;

import java.math.BigDecimal;

/**
 * Represents an intermediate prepared product (e.g. Tomato Sauce) that acts as an ingredient
 * for final MenuItems or other SubRecipes. Follows US-9.1.
 */
@Entity
@Table(
    name = "sub_recipe",
    indexes = {
        @Index(name = "uq_sub_recipe_name", columnList = "name", unique = true)
    }
)
public class SubRecipe extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "yield_quantity", nullable = false, precision = 12, scale = 4)
    private BigDecimal yieldQuantity;

    @Column(name = "unit_of_measure", nullable = false, length = 30)
    private String unitOfMeasure;

    /** Current moving average cost per unit, derived from raw ingredients and yield. */
    @Column(name = "cost_per_unit", nullable = false, precision = 10, scale = 4)
    private BigDecimal costPerUnit = BigDecimal.ZERO;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public BigDecimal getYieldQuantity() { return yieldQuantity; }
    public void setYieldQuantity(BigDecimal yieldQuantity) { this.yieldQuantity = yieldQuantity; }
    public String getUnitOfMeasure() { return unitOfMeasure; }
    public void setUnitOfMeasure(String unitOfMeasure) { this.unitOfMeasure = unitOfMeasure; }
    public BigDecimal getCostPerUnit() { return costPerUnit; }
    public void setCostPerUnit(BigDecimal costPerUnit) { this.costPerUnit = costPerUnit; }
}
