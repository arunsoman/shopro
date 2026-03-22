package mls.sho.mplace.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemDto(
    UUID id,
    String productName,
    Integer quantity,
    String unit,
    BigDecimal priceAtOrder,
    BigDecimal totalPrice
) {}
