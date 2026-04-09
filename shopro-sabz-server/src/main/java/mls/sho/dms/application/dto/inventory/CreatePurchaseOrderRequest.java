package mls.sho.dms.application.dto.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePurchaseOrderRequest {
    private UUID supplierId;
    private LocalDate expectedDeliveryDate;
    private List<PurchaseOrderLineRequest> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseOrderLineRequest {
        private UUID ingredientId;
        private BigDecimal orderedQty;
        private BigDecimal unitCost;
    }
}
