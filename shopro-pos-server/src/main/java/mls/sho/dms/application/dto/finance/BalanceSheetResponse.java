package mls.sho.dms.application.dto.finance;

import java.math.BigDecimal;
import java.util.List;

public record BalanceSheetResponse(
    BigDecimal totalAssets,
    BigDecimal totalLiabilities,
    BigDecimal totalEquity,
    List<CategoryBalance> assetLines,
    List<CategoryBalance> liabilityLines,
    List<CategoryBalance> equityLines
) {
    public record CategoryBalance(
        String accountCode,
        String accountName,
        BigDecimal balance
    ) {}
}
