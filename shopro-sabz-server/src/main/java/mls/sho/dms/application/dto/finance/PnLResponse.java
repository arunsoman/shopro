package mls.sho.dms.application.dto.finance;

import java.math.BigDecimal;
import java.util.List;

public record PnLResponse(
    BigDecimal totalRevenue,
    BigDecimal totalCOGS,
    BigDecimal grossProfit,
    BigDecimal totalOperatingExpenses,
    BigDecimal netIncome,
    List<CategoryBalance> revenueLines,
    List<CategoryBalance> expenseLines
) {
    public record CategoryBalance(
        String accountCode,
        String accountName,
        BigDecimal balance
    ) {}
}
