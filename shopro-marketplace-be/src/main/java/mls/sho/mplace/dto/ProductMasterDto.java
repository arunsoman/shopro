package mls.sho.mplace.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductMasterDto(
    UUID id,
    String name,
    String sku,
    String category,
    int supplierCount,
    BigDecimal price,
    String status,
    Integer stock,
    String imageUrl
) {}
