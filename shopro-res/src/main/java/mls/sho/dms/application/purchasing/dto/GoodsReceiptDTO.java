package mls.sho.dms.application.purchasing.dto;

import lombok.Data;
import mls.sho.dms.common.enums.GoodsReceiptStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class GoodsReceiptDTO {
    private Long id;
    private Long supplierId;
    private String supplierName;
    private Long purchaseOrderId;
    private String poNumber;
    private LocalDateTime receivedDate;
    private BigDecimal totalAmount;
    private GoodsReceiptStatus status;
    private String notes;
    private List<PurchaseOrderLineDTO> lines;

    @Data
    public static class GoodsReceiptLineDTO {
        private Long id;
        private Long ingredientId;
        private String ingredientDescription;
        private BigDecimal receivedQty;
        private BigDecimal unitPrice;
        private BigDecimal lineTotal;  // receivedQty * unitPrice
        private boolean hasConflict;
        private String conflictReason;
    }
}
