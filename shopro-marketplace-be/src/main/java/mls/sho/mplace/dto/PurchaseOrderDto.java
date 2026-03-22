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
    LocalDate deliveryDate,
    String deliveryAddress,
    String specialInstructions,
    String internalNotes,
    boolean approvalRequired,
    String approvalStatus,
    String source,
    LocalDateTime raisedAt,
    Integer itemCount,
    List<SubOrderDto> subOrders,
    List<OrderItemDto> items
) {
    public record OrderItemCreateRequest(
        String itemId,
        double quantity,
        String unit,
        java.math.BigDecimal unitPrice
    ) {}
}
