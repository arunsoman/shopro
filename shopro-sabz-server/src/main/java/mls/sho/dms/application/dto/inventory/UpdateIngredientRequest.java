package mls.sho.dms.application.dto.inventory;

import mls.sho.dms.entity.inventory.RestockingMode;
import mls.sho.dms.entity.inventory.StorageType;

import java.math.BigDecimal;
import java.util.List;
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
    RestockingMode restockingMode,
    Integer shelfLifeDays,
    StorageType storageType,
    Boolean dailyRestockEnrolled,
    String category,
    List<UUID> bidSupplierPool,
    Set<String> allergens,
    UUID supplierId,
    Integer bidClosingDays,
    Integer expectedArrivalDays
) {}
