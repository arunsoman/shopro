package mls.sho.dms.application.dto.inventory;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record PriceComparisonResponse(
    UUID ingredientId,
    String ingredientName,
    List<SupplierPrice> prices
) {
    public record SupplierPrice(
        UUID supplierId,
        String supplierName,
        BigDecimal price,
        String vendorSku,
        int leadTime,
        BigDecimal vendorRating,
        boolean isLowest
    ) {}
}
