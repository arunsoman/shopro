package mls.sho.mplace.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record PurchaseOrderDto(
    UUID id,
    String referenceNumber,
    String restaurantName,
    BigDecimal totalAmount,
    String status,
    String displayStatus,
    LocalDate deliveryDate,
    String deliveryAddress,
    String specialInstructions,
    String internalNotes,
    boolean approvalRequired,
    String approvalStatus,
    String source,
    LocalDateTime raisedAt,
    int itemCount,
    List<SubOrderDto> subOrders,
    List<OrderItemDto> items,
    List<POActivityDto> activities,
    int fulfillmentScore
) {
    public record OrderItemCreateRequest(
        String itemId,
        double quantity,
        String unit,
        java.math.BigDecimal unitPrice
    ) {}
}
