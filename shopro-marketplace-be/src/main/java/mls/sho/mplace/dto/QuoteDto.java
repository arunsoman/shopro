package mls.sho.mplace.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record QuoteDto(
    UUID id,
    String supplierName,
    Integer supplierTrustScore,
    BigDecimal totalAmount,
    String status,
    Integer leadTime,
    Double reliabilityScore,
    LocalDateTime submittedAt
) {}
