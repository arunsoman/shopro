package mls.sho.dms.application.dto.inventory;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.UUID;

public record CreateIngredientRequest(
    @NotBlank(message = "Name is required.")
    @Size(max = 120, message = "Name must be 120 characters or fewer.")
    String name,

    @NotBlank(message = "Unit of measure is required.")
    @Size(max = 20, message = "Unit of measure must be 20 characters or fewer.")
    String unitOfMeasure,

    @NotNull(message = "Cost per unit is required.")
    @DecimalMin(value = "0.0000", message = "Cost must be 0 or greater.")
    BigDecimal costPerUnit,

    @NotNull(message = "Yield percentage is required.")
    @DecimalMin(value = "0.0100", message = "Yield must be at least 1%.")
    @DecimalMax(value = "1.0000", message = "Yield cannot exceed 100%.")
    BigDecimal yieldPct,

    @NotNull(message = "Par level is required.")
    @DecimalMin(value = "0.0000", message = "Par level cannot be negative.")
    BigDecimal parLevel,

    @NotNull(message = "Reorder point is required.")
    @DecimalMin(value = "0.0000", message = "Reorder point cannot be negative.")
    BigDecimal reorderPoint,

    @NotNull(message = "Safety level is required.")
    @DecimalMin(value = "0.0000", message = "Safety level cannot be negative.")
    BigDecimal safetyLevel,

    @NotNull(message = "Critical level is required.")
    @DecimalMin(value = "0.0000", message = "Critical level cannot be negative.")
    BigDecimal criticalLevel,

    @NotNull(message = "Max stock level is required.")
    @DecimalMin(value = "0.0000", message = "Max stock level cannot be negative.")
    BigDecimal maxStockLevel,

    boolean autoReplenish,

    java.util.Set<mls.sho.dms.entity.inventory.Allergen> allergens,

    UUID supplierId
) {}
