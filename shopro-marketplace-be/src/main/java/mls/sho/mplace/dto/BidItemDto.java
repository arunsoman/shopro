package mls.sho.mplace.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record BidItemDto(
    UUID id,
    String productName,
    BigDecimal quantity,
    String unit
) {}
