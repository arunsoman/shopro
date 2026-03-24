package mls.sho.mplace.dto;

import java.math.BigDecimal;

public record LedgerStatsDto(
    BigDecimal platformFloat,
    BigDecimal pendingPayouts,
    BigDecimal accountsReceivable,
    String settlementAccuracy
) {}
