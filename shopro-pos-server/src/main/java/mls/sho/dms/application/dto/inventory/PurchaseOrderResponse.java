package mls.sho.dms.application.dto.inventory;

import lombok.Builder;
import lombok.Data;
import mls.sho.dms.entity.inventory.PurchaseOrderStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class PurchaseOrderResponse {
    private UUID id;
    private String supplierName;
    private PurchaseOrderStatus status;
    private BigDecimal totalValue;
    private LocalDate expectedDeliveryDate;
    private List<PurchaseOrderLineResponse> items;

    @Data
    @Builder
    public static class PurchaseOrderLineResponse {
        private String ingredientName;
        private BigDecimal orderedQty;
        private String unitOfMeasure;
    }
}
