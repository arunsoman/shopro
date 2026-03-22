package mls.sho.mplace.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record SubOrderDetailsDto(
    UUID id,
    String referenceNumber,
    String parentPoReference,
    String supplierName,
    BigDecimal totalAmount,
    String status,
    LocalDateTime createdAt,
    String deliveryWindow
) {}
