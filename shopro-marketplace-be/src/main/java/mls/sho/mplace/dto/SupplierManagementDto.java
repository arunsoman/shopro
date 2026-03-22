package mls.sho.mplace.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record SupplierManagementDto(
    UUID id,
    String name,
    String category,
    BigDecimal volume,
    String status,
    Integer trustScore,
    BigDecimal fulfillmentRate,
    String imageUrl
) {}
