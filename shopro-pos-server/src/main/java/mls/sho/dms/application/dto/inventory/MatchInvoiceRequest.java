package mls.sho.dms.application.dto.inventory;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Data
public class MatchInvoiceRequest {
    private String invoiceNumber;
    private Map<UUID, BigDecimal> invoicedQuantities;
    private Map<UUID, BigDecimal> invoicedPrices;
    private BigDecimal totalAmount;
    private BigDecimal taxAmount;
}
