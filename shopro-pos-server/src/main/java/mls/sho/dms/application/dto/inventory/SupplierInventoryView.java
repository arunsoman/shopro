package mls.sho.dms.application.dto.inventory;

import java.util.UUID;

public record SupplierInventoryView(
    UUID ingredientId,
    String ingredientName,
    double currentStock,
    String unitOfMeasure,
    double parLevel,
    boolean belowPar,
    double currentVendorPrice
) {}
