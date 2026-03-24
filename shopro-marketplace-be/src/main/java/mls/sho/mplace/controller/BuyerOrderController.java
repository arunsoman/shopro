package mls.sho.mplace.controller;

import mls.sho.mplace.dto.FoodInventoryDto;
import mls.sho.mplace.dto.PurchaseOrderDto;
import mls.sho.mplace.service.OrderService;
import mls.sho.mplace.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Buyer (Restaurant) Order Controller
 * Scoped to /api/buyer/**
 */
@RestController
@RequestMapping("/api/buyer/orders")
@RequiredArgsConstructor
public class BuyerOrderController {

    private final OrderService orderService;
    private final SecurityUtils securityUtils;

    public record POItem(String id, String name, double price, int qty, String unit) {}
    public record PODetail(String id, String status, String displayStatus, String placedDate, String expectedDelivery, List<POItem> items, double total, List<mls.sho.mplace.dto.POActivityDto> activities) {}
    public record OrderSummary(String id, String date, int items, double total, String status, String displayStatus, String tracking) {}

    @GetMapping
    public List<OrderSummary> getOrders() {
        return orderService.getAllOrders().stream()
                .map(po -> new OrderSummary(
                        po.id().toString(),
                        po.raisedAt() != null ? po.raisedAt().toString() : "N/A",
                        po.itemCount(),
                        po.totalAmount().doubleValue(),
                        po.status(),
                        po.displayStatus(),
                        "N/A"
                )).toList();
    }

    @GetMapping("/{id}")
    public PODetail getOrderDetail(@PathVariable String id) {
        PurchaseOrderDto po = orderService.getOrderById(UUID.fromString(id));
        if (po == null) return null;

        List<POItem> itemDtos = po.items().stream()
            .map(item -> new POItem(
                item.id().toString(),
                item.productName(),
                item.priceAtOrder().doubleValue(),
                item.quantity(),
                item.unit()
            )).toList();

        return new PODetail(
            po.id().toString(),
            po.status(),
            po.displayStatus(),
            po.raisedAt() != null ? po.raisedAt().toString() : "N/A",
            po.deliveryDate() != null ? po.deliveryDate().toString() : "N/A",
            itemDtos, 
            po.totalAmount().doubleValue(),
            po.activities().stream().filter(a -> !a.internal()).toList()
        );
    }

    public record POCreateRequest(
        List<PurchaseOrderDto.OrderItemCreateRequest> items,
        String deliveryDate,
        String deliveryAddress,
        String specialInstructions,
        String internalNotes
    ) {}

    @PostMapping
    public Map<String, String> createPO(@RequestBody POCreateRequest payload) {
        var requester = securityUtils.getCurrentRequester();
        if (requester == null || !requester.isBuyer()) {
            throw new org.springframework.security.access.AccessDeniedException("Buyer access required");
        }

        java.time.LocalDate deliveryDate = java.time.LocalDate.parse(payload.deliveryDate());
        System.out.println("DEBUG: Controller calling createOrder for restaurant: " + requester.restaurantId());
        var po = orderService.createOrder(
            requester.restaurantId(), 
            payload.items(), 
            deliveryDate,
            payload.deliveryAddress(),
            payload.specialInstructions(),
            payload.internalNotes()
        );

        return Map.of("id", po.getId().toString(), "status", po.getStatus().name());
    }
}
