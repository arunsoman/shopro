package mls.sho.mplace.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductDto(
    UUID id,
    String name,
    String description,
    BigDecimal price,
    String supplierName,
    String categoryName,
    boolean inStock
) {}
