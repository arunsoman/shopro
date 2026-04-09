package mls.sho.dms.tax.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record TaxCalculationResponse(
    UUID ticketId,
    BigDecimal subtotal,
    BigDecimal totalTax,
    BigDecimal serviceChargeTax,
    BigDecimal finalTotal,
    List<TaxLineItemResult> items,
    Map<String, BigDecimal> taxSummary // Combined totals per tax code
) {}
