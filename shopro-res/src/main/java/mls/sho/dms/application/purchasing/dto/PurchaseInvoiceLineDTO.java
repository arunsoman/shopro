package mls.sho.dms.application.purchasing.dto;

import lombok.Data;
import mls.sho.dms.common.enums.PurchaseCategory;
import java.math.BigDecimal;

/**
 * DTO for PurchaseInvoiceLine entity.
 */
@Data
public class PurchaseInvoiceLineDTO {
    private Long id;
    private PurchaseCategory purchaseCategory;
    private BigDecimal amount;
}
