package mls.sho.dms.application.purchasing.dto;

import lombok.Data;
import java.math.BigDecimal;

/**
 * Line item DTO for PurchaseOrderLine.
 */
@Data
public class PurchaseOrderLineDTO {
    private Long id;
    private Long ingredientId;
    private String ingredientCode;
    private String ingredientDescription;
    private String orderedUnit;
    private BigDecimal orderedQty;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
    private BigDecimal receivedQty;
}
