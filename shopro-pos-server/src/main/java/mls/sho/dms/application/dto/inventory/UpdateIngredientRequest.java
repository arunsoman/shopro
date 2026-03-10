package mls.sho.dms.application.dto.inventory;

import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

public record UpdateIngredientRequest(
    String name,
    String unitOfMeasure,
    BigDecimal costPerUnit,
    BigDecimal yieldPct,
    BigDecimal parLevel,
    BigDecimal reorderPoint,
    BigDecimal safetyLevel,
    BigDecimal criticalLevel,
    BigDecimal maxStockLevel,
    Boolean autoReplenish,
    Set<String> allergens,
    UUID supplierId
) {}
