package mls.sho.dms.web.controller.order;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.order.*;
import mls.sho.dms.application.service.order.OrderService;
import mls.sho.dms.entity.order.TicketStatus;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Order Management", description = "Endpoints for creating and managing order tickets")
@lombok.extern.slf4j.Slf4j
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrder(
        @Valid @RequestBody CreateOrderRequest request
    ) {
        log.debug("Received CreateOrderRequest: {}", request);
        String username = "Maria Manager";
        OrderResponse response = orderService.createOrder(request, username);
        log.debug("Created order: {} for user: {}", response.id(), username);
        return response;
    }

    @GetMapping("/active")
    public java.util.List<OrderResponse> getActiveOrders() {
        return orderService.getActiveOrders();
    }

    @PatchMapping("/{id:[0-9a-fA-F-]{36}}/status")
    public OrderResponse updateStatus(@PathVariable UUID id, @RequestParam TicketStatus status) {
        return orderService.updateStatus(id, status);
    }

    @GetMapping("/{id:[0-9a-fA-F-]{36}}")
    public OrderResponse getOrder(@PathVariable UUID id) {
        return orderService.findById(id);
    }

    @PostMapping("/{id:[0-9a-fA-F-]{36}}/items")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse addOrderItem(
        @PathVariable UUID id,
        @Valid @RequestBody AddOrderItemRequest request
    ) {
        return orderService.addOrderItem(id, request);
    }

    @PatchMapping("/{id:[0-9a-fA-F-]{36}}/items/{itemId:[0-9a-fA-F-]{36}}/quantity")
    public OrderResponse updateItemQuantity(
        @PathVariable UUID id,
        @PathVariable UUID itemId,
        @RequestParam int newQuantity
    ) {
        return orderService.updateItemQuantity(id, itemId, newQuantity);
    }

    @PostMapping("/{id:[0-9a-fA-F-]{36}}/send")
    public OrderResponse sendToKitchen(@PathVariable UUID id) {
        log.debug("Received request to send order {} to kitchen", id);
        OrderResponse response = orderService.sendToKitchen(id);
        log.debug("Order {} successfully sent to kitchen", id);
        return response;
    }

    @PostMapping("/{id:[0-9a-fA-F-]{36}}/serve")
    public OrderResponse markAsServed(@PathVariable UUID id) {
        log.debug("Received request to mark order {} as served", id);
        return orderService.markAsServed(id);
    }

    @PostMapping("/{id:[0-9a-fA-F-]{36}}/courses/{courseNumber}/fire")
    public OrderResponse fireCourse(
        @PathVariable UUID id,
        @PathVariable int courseNumber
    ) {
        log.debug("Received request to fire course {} for order {}", courseNumber, id);
        return orderService.fireCourse(id, courseNumber);
    }

    @PostMapping("/{id:[0-9a-fA-F-]{36}}/discount")
    public OrderResponse applyDiscount(
        @PathVariable UUID id,
        @RequestParam BigDecimal amount,
        @RequestParam(defaultValue = "false") boolean isPercentage,
        @RequestParam String managerPin
    ) {
        return orderService.applyDiscount(id, amount, isPercentage, managerPin);
    }

    @GetMapping("/history")
    public java.util.List<OrderResponse> getOrderHistory(
        @RequestParam(required = false) String orderId,
        @RequestParam(required = false) String tableName,
        @RequestParam(required = false) java.time.Instant startDate,
        @RequestParam(required = false) java.time.Instant endDate,
        @RequestParam(required = false) String serverName
    ) {
        return orderService.searchOrders(orderId, tableName, startDate, endDate, serverName);
    }

    @PostMapping("/{id:[0-9a-fA-F-]{36}}/cancel")
    public OrderResponse cancelOrder(
        @PathVariable UUID id,
        @RequestParam(required = false) String managerPin
    ) {
        log.debug("Received request to cancel order {}", id);
        return orderService.cancelOrder(id, "Maria Manager", managerPin);
    }

    @PostMapping("/{id:[0-9a-fA-F-]{36}}/items/{itemId:[0-9a-fA-F-]{36}}/void")
    public OrderResponse voidOrderItem(
        @PathVariable UUID id,
        @PathVariable UUID itemId,
        @RequestParam String reason,
        @RequestParam(required = false) String managerPin
    ) {
        log.debug("Received request to void item {} from order {}", itemId, id);
        return orderService.voidOrderItem(id, itemId, reason, "Maria Manager", managerPin);
    }
}
