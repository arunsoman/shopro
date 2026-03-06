package mls.sho.dms.application.service.inventory.impl;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.inventory.LogWasteRequest;
import mls.sho.dms.application.exception.ResourceNotFoundException;
import mls.sho.dms.application.service.inventory.IngredientService;
import mls.sho.dms.application.service.inventory.RecipeService;
import mls.sho.dms.application.service.inventory.WasteService;
import mls.sho.dms.entity.inventory.InventoryTransactionType;
import mls.sho.dms.entity.order.OrderItem;
import mls.sho.dms.repository.order.OrderItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@Transactional
@RequiredArgsConstructor
public class WasteServiceImpl implements WasteService {

    private final IngredientService ingredientService;
    private final RecipeService recipeService;
    private final OrderItemRepository orderItemRepository;

    @Override
    public void logWaste(LogWasteRequest request) {
        if (request.orderItemId() != null) {
            OrderItem orderItem = orderItemRepository.findById(request.orderItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Order item not found"));

            recipeService.findLatestByMenuItem(orderItem.getMenuItem().getId())
                    .ingredients().forEach(ri -> {
                        BigDecimal wasteQty = ri.quantity().multiply(request.quantity()).negate();
                        ingredientService.updateStock(
                                ri.ingredientId(),
                                wasteQty,
                                InventoryTransactionType.WASTE,
                                "Waste reason: " + request.reason().name() + (request.notes() != null ? " - " + request.notes() : ""),
                                request.orderItemId()
                        );
                    });
        } else if (request.ingredientId() != null) {
            BigDecimal wasteQty = request.quantity().negate();
            ingredientService.updateStock(
                    request.ingredientId(),
                    wasteQty,
                    InventoryTransactionType.WASTE,
                    "Waste reason: " + request.reason().name() + (request.notes() != null ? " - " + request.notes() : ""),
                    request.ingredientId()
            );
        } else {
            throw new IllegalArgumentException("Must provide either orderItemId or ingredientId for waste logging");
        }
    }
}
