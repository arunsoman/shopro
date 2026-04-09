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
    private UUID supplierId;
    private String supplierName;
    private PurchaseOrderStatus status;
    private BigDecimal totalValue;
    private LocalDate expectedDeliveryDate;
    private java.time.Instant createdAt;
    private java.time.Instant acknowledgedAt;
    private java.time.Instant shippedAt;
    private BigDecimal counterOfferPrice;
    private BigDecimal counterOfferQty;
    private String counterOfferNotes;
    private String trackingNumber;
    private String deliveryNoteRef;
    private List<PurchaseOrderLineResponse> items;

    @Data
    @Builder
    public static class PurchaseOrderLineResponse {
        private UUID id;
        private UUID ingredientId;
        private String ingredientName;
        private BigDecimal orderedQty;
        private BigDecimal unitCost;
        private String unitOfMeasure;
    }
}
