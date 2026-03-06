package mls.sho.dms.application.service.inventory.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record TvaReportRow(
    UUID ingredientId,
    String ingredientName,
    String unitOfMeasure,
    BigDecimal openingStock,
    BigDecimal purchases,
    BigDecimal theoreticalUsage,
    BigDecimal theoreticalClosingStock,
    BigDecimal actualClosingStock,
    BigDecimal variance,
    BigDecimal variancePercentage,
    boolean isShrinkageAlert
) {}
