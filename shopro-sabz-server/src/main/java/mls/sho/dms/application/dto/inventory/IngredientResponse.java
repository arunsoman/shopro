package mls.sho.dms.application.dto.inventory;

import mls.sho.dms.entity.inventory.RestockingMode;
import mls.sho.dms.entity.inventory.StorageType;

import java.math.BigDecimal;
import java.util.List;
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
    RestockingMode restockingMode,
    int shelfLifeDays,
    StorageType storageType,
    boolean dailyRestockEnrolled,
    String category,
    List<UUID> bidSupplierPool,
    java.util.Set<String> allergens,
    UUID supplierId,
    String supplierName,
    UUID activeOrderId,
    String activeOrderType,
    String activeOrderStatus,
    int bidClosingDays,
    int expectedArrivalDays
) {}
