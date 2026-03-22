package mls.sho.mplace.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record SubOrderDto(
    UUID id,
    String supplierName,
    BigDecimal totalAmount,
    String status,
    List<OrderItemDto> items
) {}
