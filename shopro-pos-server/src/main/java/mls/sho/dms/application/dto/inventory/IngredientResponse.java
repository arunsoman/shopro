package mls.sho.dms.application.dto.inventory;

import java.math.BigDecimal;
import java.util.UUID;

public record IngredientResponse(
    UUID id,
    String name,
    String unitOfMeasure,
    BigDecimal costPerUnit,
    BigDecimal yieldPct,
    BigDecimal effectiveCostPerUnit,
    BigDecimal currentStock,
    BigDecimal parLevel,
    BigDecimal reorderPoint,
    BigDecimal safetyLevel,
    BigDecimal criticalLevel,
    BigDecimal maxStockLevel,
    boolean autoReplenish,
    java.util.Set<String> allergens,
    UUID supplierId,
    String supplierName
) {}
