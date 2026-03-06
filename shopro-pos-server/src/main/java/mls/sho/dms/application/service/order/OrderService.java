package mls.sho.dms.application.service.order;

import mls.sho.dms.application.dto.order.*;
import mls.sho.dms.entity.order.TicketStatus;
import java.math.BigDecimal;
import java.util.UUID;

public interface OrderService {
    
    /** Start a new order. */
    OrderResponse createOrder(CreateOrderRequest request, String performedBy);
    
    /** Add a line item to an order. */
    OrderResponse addOrderItem(UUID orderId, AddOrderItemRequest request);
    
    /** Increase/decrease quantity of an item. */
    OrderResponse updateItemQuantity(UUID orderId, UUID itemId, int newQuantity);
    
    /** Send unsubmitted items to the kitchen. */
    OrderResponse sendToKitchen(UUID orderId);
    
    /** Fire a specific course to the kitchen. */
    OrderResponse fireCourse(UUID orderId, int courseNumber);
    
    /** Retrieve an order by ID. */
    OrderResponse findById(UUID id);
    
    /** Apply a manager discount. */
    OrderResponse applyDiscount(UUID orderId, BigDecimal amount, boolean isPercentage, String managerPin);

    /** Finalize and pay for an order. */
    OrderResponse finalizeOrder(UUID orderId);

    /** Mark an order as served to the guest. */
    OrderResponse markAsServed(UUID orderId);

    /** Update ticket status. */
    OrderResponse updateStatus(UUID orderId, TicketStatus status);

    /** Retrieve all active orders (OPEN, SUBMITTED). */
    java.util.List<OrderResponse> getActiveOrders();

    /** Search for past orders with filters. */
    java.util.List<OrderResponse> searchOrders(
        String orderId,
        String tableName,
        java.time.Instant startDate,
        java.time.Instant endDate,
        String serverName
    );

    /** Cancel a whole order. */
    OrderResponse cancelOrder(UUID orderId, String performedBy, String managerPin);

    /** Void a specific item from an order. */
    OrderResponse voidOrderItem(UUID orderId, UUID itemId, String reason, String performedBy, String managerPin);
}
