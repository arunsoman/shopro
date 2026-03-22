package mls.sho.mplace.dto;

import java.math.BigDecimal;

public record DashboardMetricsDto(
    String totalVolume,
    long totalRestaurants,
    long totalSuppliers,
    int pendingPayouts,
    String systemHealth
) {}
