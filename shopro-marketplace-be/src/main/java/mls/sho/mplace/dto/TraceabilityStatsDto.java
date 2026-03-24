package mls.sho.mplace.dto;

import java.math.BigDecimal;

public record TraceabilityStatsDto(
    long totalLogs,
    long activeNodes,
    String integrityScore
) {}
