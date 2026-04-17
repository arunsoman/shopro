package mls.sho.dms.application.purchasing.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ReceiveStockRequest {
    private Long supplierId;
    private String receivedDate;
    private String notes;
    private List<LineItem> lines;

    @Data
    public static class LineItem {
        private Long ingredientId;
        private BigDecimal receivedQty;
        private BigDecimal unitPrice;
    }
}
