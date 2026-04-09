package mls.sho.dms.application.inventory.web;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.inventory.dto.InventoryIntelligenceDtos.*;
import mls.sho.dms.application.inventory.service.InventoryIntelligenceService;
import mls.sho.dms.application.pos.repository.OrderRepository;
import mls.sho.dms.application.pos.repository.MenuItemRepository;
import mls.sho.dms.entity.MenuItem;
import mls.sho.dms.entity.Order;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/inventory/intelligence")
@RequiredArgsConstructor
public class InventoryIntelligenceController {

    private final InventoryIntelligenceService intelligenceService;
    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;

    // -- Operational Endpoints (The Kitchen Command) --

    @PostMapping("/fulfill-order/{orderId}")
    public ResponseEntity<Void> fulfillOrder(@PathVariable Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        intelligenceService.orderFulfillment(order);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/record-misfire")
    public ResponseEntity<Void> recordMisfire(
            @PathVariable Long restaurantId,
            @RequestParam Long menuId,
            @RequestParam(required = false) Long orderId,
            @RequestParam String reason,
            @RequestParam Long employeeId) {
        
        MenuItem item = menuItemRepository.findById(menuId)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
        
        intelligenceService.recordMisfire(item.getRestaurant(), item, orderId, reason, employeeId);
        return ResponseEntity.ok().build();
    }

    // -- Intelligence Endpoints (The Business Audit) --

    @GetMapping("/profitability/{menuId}")
    public ResponseEntity<MenuProfitabilityDto> getMenuProfitability(
            @PathVariable Long restaurantId,
            @PathVariable Long menuId) {
        
        MenuItem item = menuItemRepository.findById(menuId)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
        
        return ResponseEntity.ok(intelligenceService.getMenuProfitability(menuId, item));
    }

    @GetMapping("/wastage/summary")
    public ResponseEntity<WasteSummaryDto> getWasteSummary(
            @PathVariable Long restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        
        return ResponseEntity.ok(intelligenceService.getWasteSummary(restaurantId, start, end));
    }

    @GetMapping("/ingredient/{ingredientId}/on-hand")
    public ResponseEntity<BigDecimal> getDerivedOnHand(
            @PathVariable Long restaurantId,
            @PathVariable Long ingredientId) {
        return ResponseEntity.ok(intelligenceService.getLiveQuantity(restaurantId, ingredientId));
    }
}
