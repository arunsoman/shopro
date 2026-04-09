package mls.sho.dms.application.service.inventory.impl;

import mls.sho.dms.application.dto.inventory.LogWasteRequest;
import mls.sho.dms.application.dto.inventory.RecipeIngredientResponse;
import mls.sho.dms.application.dto.inventory.RecipeResponse;
import mls.sho.dms.application.service.inventory.IngredientService;
import mls.sho.dms.application.service.inventory.RecipeService;
import mls.sho.dms.entity.inventory.InventoryTransactionType;
import mls.sho.dms.entity.inventory.WasteReason;
import mls.sho.dms.entity.menu.MenuItem;
import mls.sho.dms.entity.order.OrderItem;
import mls.sho.dms.repository.order.OrderItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WasteServiceImplTest {

    @Mock
    private IngredientService ingredientService;

    @Mock
    private RecipeService recipeService;

    @Mock
    private OrderItemRepository orderItemRepository;

    @InjectMocks
    private WasteServiceImpl wasteService;

    private UUID orderItemId;
    private UUID ingredientId;
    private UUID menuItemId;
    private UUID staffId;

    @BeforeEach
    void setUp() {
        orderItemId = UUID.randomUUID();
        ingredientId = UUID.randomUUID();
        menuItemId = UUID.randomUUID();
        staffId = UUID.randomUUID();
    }

    @Test
    void logWaste_withOrderItem_depletesRecipeIngredients() {
        // Arrange
        LogWasteRequest request = new LogWasteRequest(orderItemId, null, WasteReason.DROPPED_PLATE, BigDecimal.ONE, "Fell on floor", staffId, null);
        
        MenuItem menuItem = new MenuItem();
        menuItem.setId(menuItemId);
        
        OrderItem orderItem = new OrderItem();
        orderItem.setId(orderItemId);
        orderItem.setMenuItem(menuItem);
        
        when(orderItemRepository.findById(orderItemId)).thenReturn(Optional.of(orderItem));
        
        RecipeIngredientResponse ri1 = new RecipeIngredientResponse(ingredientId, "Tomato", BigDecimal.valueOf(2), "oz", BigDecimal.valueOf(0.5));
        RecipeResponse recipeResponse = new RecipeResponse(UUID.randomUUID(), menuItemId, 1, BigDecimal.ONE, List.of(ri1));
        
        when(recipeService.findLatestByMenuItem(menuItemId)).thenReturn(recipeResponse);

        // Act
        wasteService.logWaste(request);

        // Assert
        verify(ingredientService).updateStock(
                eq(ingredientId),
                eq(BigDecimal.valueOf(2).negate()), // 2 * 1 * -1
                eq(InventoryTransactionType.WASTE),
                eq("Waste reason: DROPPED_PLATE - Fell on floor"),
                eq(orderItemId)
        );
    }

    @Test
    void logWaste_withIngredientId_depletesIngredientDirectly() {
        // Arrange
        LogWasteRequest request = new LogWasteRequest(null, ingredientId, WasteReason.EXPIRED, BigDecimal.valueOf(5), "Bad smell", staffId, UUID.randomUUID());

        // Act
        wasteService.logWaste(request);

        // Assert
        verify(ingredientService).updateStock(
                eq(ingredientId),
                eq(BigDecimal.valueOf(5).negate()),
                eq(InventoryTransactionType.WASTE),
                eq("Waste reason: EXPIRED - Bad smell"),
                eq(ingredientId)
        );
        verifyNoInteractions(recipeService);
        verifyNoInteractions(orderItemRepository);
    }

    @Test
    void logWaste_missingBothIds_throwsException() {
        // Arrange
        LogWasteRequest request = new LogWasteRequest(null, null, WasteReason.OTHER, BigDecimal.ONE, null, staffId, null);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> wasteService.logWaste(request));
        verifyNoInteractions(ingredientService);
    }
}
