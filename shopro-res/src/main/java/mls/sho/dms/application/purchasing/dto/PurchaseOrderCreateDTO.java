package mls.sho.dms.application.purchasing.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for creating a new Purchase Order.
 */
@Data
public class PurchaseOrderCreateDTO {
    private Long supplierId;
    private String issueDate; // Received as ISO string from frontend
    private String notes;
    private List<LineItem> lines;

    @Data
    public static class LineItem {
        private Long ingredientId;
        private BigDecimal orderedQty;
        private BigDecimal unitPrice;
    }
}
