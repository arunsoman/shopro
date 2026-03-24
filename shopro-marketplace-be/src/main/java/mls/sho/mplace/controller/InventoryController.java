package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.dto.FoodInventoryDto;
import mls.sho.mplace.entity.InventoryItem;
import mls.sho.mplace.service.InventoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/restaurant/{id}")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/inventory")
    public List<FoodInventoryDto> getInventory(@PathVariable("id") UUID restaurantId) {
        return inventoryService.getFoodInventory(restaurantId);
    }

    @PostMapping("/inventory")
    public FoodInventoryDto addToInventory(
            @PathVariable("id") UUID restaurantId,
            @RequestBody InventoryRequest request) {
        return inventoryService.addToFoodInventory(restaurantId, request.foodId());
    }

    @PostMapping("/purchase-orders")
    public FoodInventoryDto createPurchaseOrder(
            @PathVariable("id") UUID restaurantId,
            @RequestBody InventoryRequest request) {
        return inventoryService.createFoodPurchaseOrder(restaurantId, request.foodId());
    }

    public record InventoryRequest(Integer foodId) {}
}
