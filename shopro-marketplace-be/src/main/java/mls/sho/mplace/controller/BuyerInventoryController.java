package mls.sho.mplace.controller;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;
import mls.sho.mplace.entity.InventoryItem;
import mls.sho.mplace.util.SecurityUtils;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Buyer (Restaurant) Inventory & Automation Controller
 * Scoped to /api/buyer/**
 */
@RestController
@RequestMapping("/api/buyer/inventory")
@RequiredArgsConstructor
public class BuyerInventoryController {

    private final mls.sho.mplace.service.InventoryService inventoryService;
    private final SecurityUtils securityUtils;

    public record StockItem(String id, String name, double current, double min, String unit, String health) {}
    public record AutoRule(String id, String product, double threshold, int qty, boolean active) {}

    @GetMapping
    public List<StockItem> getStock() {
        return inventoryService.getInventory().stream()
                .map(i -> new StockItem(
                        i.getId().toString(),
                        i.getProduct() != null ? i.getProduct().getName() : "Unknown Product",
                        i.getCurrentQuantity() != null ? i.getCurrentQuantity().doubleValue() : 0.0,
                        i.getMinimumThreshold() != null ? i.getMinimumThreshold().doubleValue() : 0.0,
                        i.getProduct() != null ? i.getProduct().getUnit() : "unit",
                        i.getHealth()
                )).collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/predictions")
    public Map<String, Object> getPredictions() {
        return Map.of(
            "stockoutRisk", List.of("WHOLE_MILK_V3", "SUNDRIED_TOMATOES.X"),
            "recommendedReorder", List.of("PREMIUM_ARABICA_BEANS"),
            "forecastConfidence", 92,
            "trajectory", "UPWARD_TREND"
        );
    }

    @GetMapping("/rules")
    public List<AutoRule> getRules() {
        return inventoryService.getReorderRules().stream()
                .map(r -> new AutoRule(
                        r.getId().toString(),
                        r.getProduct().getName(),
                        r.getAlert().doubleValue(),
                        r.getReorderQuantity().intValue(),
                        r.isActive()
                )).toList();
    }

    @GetMapping("/foods")
    public List<mls.sho.mplace.dto.FoodInventoryDto> getFoodInventory() {
        var requester = securityUtils.getCurrentRequester();
        if (requester == null || !requester.isBuyer()) return List.of();
        return inventoryService.getFoodInventory(requester.restaurantId());
    }

    @PostMapping("/foods")
    public mls.sho.mplace.dto.FoodInventoryDto addFoodToInventory(@RequestBody InventoryController.InventoryRequest request) {
        var requester = securityUtils.getCurrentRequester();
        if (requester == null || !requester.isBuyer()) {
            throw new org.springframework.security.access.AccessDeniedException("User must be logged in as a buyer to manage inventory");
        }
        if (request.foodId() == null) {
            throw new IllegalArgumentException("Food ID is required");
        }
        return inventoryService.addToFoodInventory(requester.restaurantId(), request.foodId());
    }

    @PostMapping("/foods/purchase-orders")
    public mls.sho.mplace.dto.FoodInventoryDto createFoodPO(@RequestBody InventoryController.InventoryRequest request) {
        var requester = securityUtils.getCurrentRequester();
        if (requester == null || !requester.isBuyer()) {
            throw new org.springframework.security.access.AccessDeniedException("User must be logged in as a buyer to place purchase orders");
        }
        if (request.foodId() == null) {
            throw new IllegalArgumentException("Food ID is required");
        }
        return inventoryService.createFoodPurchaseOrder(requester.restaurantId(), request.foodId());
    }

    @PutMapping("/foods/{inventoryItemId}")
    public mls.sho.mplace.dto.FoodInventoryDto updateInventorySettings(
            @PathVariable UUID inventoryItemId,
            @RequestBody mls.sho.mplace.dto.InventorySettingsRequest request) {
        return inventoryService.updateInventorySettings(inventoryItemId, request.leadTime(), request.alertLevel(), request.reorderCount());
    }
}
