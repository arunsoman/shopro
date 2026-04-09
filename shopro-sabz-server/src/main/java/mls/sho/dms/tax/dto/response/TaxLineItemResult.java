package mls.sho.dms.tax.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record TaxLineItemResult(
    UUID itemId,
    BigDecimal baseAmount,
    BigDecimal totalTax,
    List<TaxBreakdownEntry> breakdowns,
    GstSplit gstSplit
) {
    public record GstSplit(BigDecimal cgst, BigDecimal sgst) {}
}
