package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.AutoReorderRule;
import mls.sho.mplace.entity.Food;
import mls.sho.mplace.entity.InventoryItem;
import mls.sho.mplace.repository.AutoReorderRuleRepository;
import mls.sho.mplace.repository.FoodRepository;
import mls.sho.mplace.repository.InventoryItemRepository;
import mls.sho.mplace.util.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final AutoReorderRuleRepository reorderRuleRepository;
    private final mls.sho.mplace.repository.RestaurantInventoryRepository inventoryRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final FoodRepository foodRepository;
    private final mls.sho.mplace.repository.ProductRepository productRepository;
    private final SecurityUtils securityUtils;

    public List<AutoReorderRule> getReorderRules() {
        var requester = securityUtils.getCurrentRequester();
        if (requester == null || !requester.isBuyer()) return Collections.emptyList();

        return reorderRuleRepository.findAllByRestaurant_Id(requester.restaurantId());
    }

    public List<mls.sho.mplace.entity.RestaurantInventory> getInventory() {
        var requester = securityUtils.getCurrentRequester();
        if (requester == null || !requester.isBuyer()) return Collections.emptyList();

        return inventoryRepository.findAllByRestaurantId(requester.restaurantId());
    }

    @Transactional
    public mls.sho.mplace.entity.RestaurantInventory saveInventory(mls.sho.mplace.entity.RestaurantInventory item) {
        var requester = securityUtils.getCurrentRequester();
        if (requester == null || !requester.isBuyer()) {
            throw new RuntimeException("Only buyers can manage inventory");
        }
        item.setRestaurantId(requester.restaurantId());
        item.setLastUpdated(java.time.LocalDateTime.now());
        return inventoryRepository.save(item);
    }

    @Transactional(readOnly = true)
    public List<mls.sho.mplace.dto.FoodInventoryDto> getFoodInventory(UUID restaurantId) {
        return inventoryItemRepository.findByRestaurantId(restaurantId).stream()
                .map(this::mapToFoodDto)
                .collect(java.util.stream.Collectors.toList());
    }

    private mls.sho.mplace.dto.FoodInventoryDto mapToFoodDto(InventoryItem item) {
        UUID productId = productRepository.findFirstByNameContainingIgnoreCase(item.getFood().getName())
                .map(mls.sho.mplace.entity.BaseEntity::getId)
                .orElse(null);

        return new mls.sho.mplace.dto.FoodInventoryDto(
                item.getId(),
                item.getRestaurantId(),
                item.getFood().getId(),
                item.getFood().getName(),
                item.getFood().getFoodGroup(),
                item.getFood().getFoodSubgroup(),
                item.getQuantity(),
                item.getUnit(),
                item.getLeadTime(),
                item.getAlertLevel(),
                item.getReorderCount(),
                item.getStatus(),
                productId
        );
    }

    @Transactional
    public InventoryItem addToFoodInventory(UUID restaurantId, Integer foodId) {
        return inventoryItemRepository.findByRestaurantIdAndFood_Id(restaurantId, foodId)
                .orElseGet(() -> {
                    Food food = foodRepository.findById(foodId)
                            .orElseThrow(() -> new RuntimeException("Food not found with id: " + foodId));
                    InventoryItem item = new InventoryItem();
                    item.setRestaurantId(restaurantId);
                    item.setFood(food);
                    item.setQuantity(0.0);
                    item.setUnit("unit"); // Default or from food if available
                    item.setLeadTime(3);   // Default restaurant-specific
                    item.setAlertLevel(10.0);
                    item.setReorderCount(50.0);
                    item.setStatus("AVAILABLE");
                    return inventoryItemRepository.save(item);
                });
    }

    @Transactional
    public InventoryItem createFoodPurchaseOrder(UUID restaurantId, Integer foodId) {
        InventoryItem item = inventoryItemRepository.findByRestaurantIdAndFood_Id(restaurantId, foodId)
                .orElseGet(() -> {
                    Food food = foodRepository.findById(foodId)
                            .orElseThrow(() -> new RuntimeException("Food not found with id: " + foodId));
                    InventoryItem newItem = new InventoryItem();
                    newItem.setRestaurantId(restaurantId);
                    newItem.setFood(food);
                    newItem.setQuantity(0.0);
                    newItem.setStatus("ORDERED");
                    return inventoryItemRepository.save(newItem);
                });
        
        if ("AVAILABLE".equals(item.getStatus()) || "OUT_OF_STOCK".equals(item.getStatus())) {
            item.setStatus("ORDERED");
            return inventoryItemRepository.save(item);
        }
        return item;
    }
}
