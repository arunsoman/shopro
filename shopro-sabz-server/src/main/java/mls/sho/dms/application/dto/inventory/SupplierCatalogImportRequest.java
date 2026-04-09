package mls.sho.dms.application.dto.inventory;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record SupplierCatalogImportRequest(
    List<CatalogItem> items
) {
    public record CatalogItem(
        String productName,
        String vendorSku,
        BigDecimal unitPrice,
        UUID mappedIngredientId
    ) {}
}
