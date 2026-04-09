package mls.sho.dms.tax.dto.response;

import java.math.BigDecimal;

public record TaxBreakdownEntry(
    String ruleCode,
    String ruleName,
    BigDecimal rate,
    BigDecimal amount
) {}
