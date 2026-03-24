package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.dto.PurchaseOrderDto;
import mls.sho.mplace.service.OrderService;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/operator/sourcing")
@RequiredArgsConstructor
public class OperatorSourcingController {

    private final OrderService orderService;

    @GetMapping("/po-inbox")
    public List<Map<String, Object>> getPOInbox() {
        return orderService.getAllOrders().stream()
            .map(po -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", po.id().toString());
                map.put("restaurant", po.restaurantName());
                map.put("amount", po.totalAmount());
                map.put("items", po.itemCount());
                map.put("status", po.displayStatus() != null ? po.displayStatus() : po.status());
                map.put("priority", po.totalAmount().doubleValue() > 5000 ? "High" : "Medium");
                return map;
            }).toList();
    }

    @GetMapping("/po-review/{id}")
    public Map<String, Object> getPOReview(@PathVariable String id) {
        PurchaseOrderDto po = orderService.getOrderById(UUID.fromString(id));
        if (po == null) return Collections.emptyMap();

        Map<String, Object> response = new HashMap<>();
        response.put("id", po.id().toString());
        response.put("restaurant", po.restaurantName());
        response.put("items", po.items().stream().map(item -> 
            Map.of("sku", item.id().toString().substring(0, 8), 
                   "name", item.productName(), 
                   "qty", item.quantity(), 
                   "price", item.priceAtOrder())
        ).toList());
        response.put("total", po.totalAmount());
        response.put("status", po.displayStatus() != null ? po.displayStatus() : po.status());
        return response;
    }

    @GetMapping("/sub-pos")
    public List<Map<String, Object>> getSubPOs() {
        return orderService.getAllSubOrders().stream()
            .map(so -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", so.referenceNumber());
                map.put("parentPO", so.parentPoReference());
                map.put("supplier", so.supplierName());
                map.put("status", so.status());
                map.put("amount", so.totalAmount());
                return map;
            }).toList();
    }

    @GetMapping("/sourcing-wizard/stats")
    public Map<String, Object> getSourcingStats() {
        return Map.of(
            "unassignedItems", 45,
            "optimalSuppliers", 12,
            "avgSavings", "14.2%"
        );
    }

    @GetMapping("/po-outbox")
    public List<Map<String, Object>> getPOOutbox() {
        return orderService.getAllSubOrders().stream()
            .map(so -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", so.referenceNumber());
                map.put("destination", so.supplierName());
                map.put("status", so.status());
                map.put("sentAt", so.createdAt() != null ? so.createdAt().toString() : "--");
                map.put("amount", so.totalAmount());
                return map;
            }).toList();
    }
}
