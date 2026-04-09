package mls.sho.dms.application.service.inventory.impl;

import mls.sho.dms.application.dto.inventory.RecipeIngredientResponse;
import mls.sho.dms.application.dto.inventory.RecipeResponse;
import mls.sho.dms.application.dto.inventory.UpdateRecipeIngredientRequest;
import mls.sho.dms.application.dto.inventory.UpdateRecipeRequest;
import mls.sho.dms.application.service.inventory.IngredientService;
import mls.sho.dms.entity.inventory.InventoryTransactionType;
import mls.sho.dms.entity.inventory.RawIngredient;
import mls.sho.dms.entity.inventory.Recipe;
import mls.sho.dms.entity.inventory.RecipeIngredient;
import mls.sho.dms.entity.menu.MenuItem;
import mls.sho.dms.entity.order.OrderItem;
import mls.sho.dms.repository.inventory.RawIngredientRepository;
import mls.sho.dms.repository.inventory.RecipeIngredientRepository;
import mls.sho.dms.repository.inventory.RecipeRepository;
import mls.sho.dms.repository.inventory.SubRecipeRepository;
import mls.sho.dms.repository.menu.MenuItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecipeServiceImplTest {

    @Mock
    private RecipeRepository recipeRepository;
    @Mock
    private MenuItemRepository menuItemRepository;
    @Mock
    private RawIngredientRepository rawIngredientRepository;
    @Mock
    private RecipeIngredientRepository recipeIngredientRepository;
    @Mock
    private IngredientService ingredientService;
    @Mock
    private SubRecipeRepository subRecipeRepository;
    @Mock
    private mls.sho.dms.application.service.inventory.BatchService batchService;

    @InjectMocks
    private RecipeServiceImpl recipeService;

    private UUID menuItemId;
    private UUID ingredientId;

    @BeforeEach
    void setUp() {
        menuItemId = UUID.randomUUID();
        ingredientId = UUID.randomUUID();
    }

    @Test
    void updateRecipe_createsNewVersion() {
        // Arrange
        MenuItem menuItem = new MenuItem();
        menuItem.setId(menuItemId);
        
        RawIngredient ingredient = new RawIngredient();
        ingredient.setId(ingredientId);
        ingredient.setName("Beef");
        ingredient.setCostPerUnit(BigDecimal.valueOf(5.0));
        ingredient.setYieldPct(BigDecimal.ONE);
        ingredient.setEffectiveCostPerUnit(BigDecimal.valueOf(5.0));
        
        Recipe existingRecipe = new Recipe();
        existingRecipe.setRecipeVersion(1);

        when(menuItemRepository.findById(menuItemId)).thenReturn(Optional.of(menuItem));
        when(recipeRepository.findLatestByMenuItem(menuItem)).thenReturn(Optional.of(existingRecipe));
        when(rawIngredientRepository.findById(ingredientId)).thenReturn(Optional.of(ingredient));
        
        when(recipeRepository.save(any(Recipe.class))).thenAnswer(i -> {
            Recipe r = i.getArgument(0);
            r.setId(UUID.randomUUID());
            return r;
        });

        UpdateRecipeRequest request = new UpdateRecipeRequest(List.of(
                new UpdateRecipeIngredientRequest(ingredientId, null, BigDecimal.valueOf(2.5))
        ));

        // Act
        RecipeResponse response = recipeService.updateRecipe(menuItemId, request);

        // Assert
        ArgumentCaptor<Recipe> recipeCaptor = ArgumentCaptor.forClass(Recipe.class);
        verify(recipeRepository).save(recipeCaptor.capture());
        
        Recipe capturedRecipe = recipeCaptor.getValue();
        assertEquals(2, capturedRecipe.getRecipeVersion());
        assertEquals(menuItem, capturedRecipe.getMenuItem());
        
        assertEquals(1, response.ingredients().size());
        assertEquals(0, BigDecimal.valueOf(12.5).compareTo(response.totalFoodCost())); // 2.5 * 5.0
    }

    @Test
    void depleteForOrderItem_depletesAllIngredients() {
        // Arrange
        MenuItem menuItem = new MenuItem();
        menuItem.setId(menuItemId);
        
        OrderItem orderItem = new OrderItem();
        orderItem.setId(UUID.randomUUID());
        orderItem.setMenuItem(menuItem);
        orderItem.setQuantity(2);
        
        Recipe recipe = new Recipe();
        
        RawIngredient ingredient = new RawIngredient();
        ingredient.setId(ingredientId);
        ingredient.setYieldPct(BigDecimal.ONE);
        
        RecipeIngredient ri = new RecipeIngredient();
        ri.setRecipe(recipe);
        ri.setIngredient(ingredient);
        ri.setQuantity(BigDecimal.valueOf(1.5));
        
        when(recipeRepository.findLatestByMenuItem(menuItem)).thenReturn(Optional.of(recipe));
        when(recipeIngredientRepository.findByRecipe(recipe)).thenReturn(List.of(ri));

        // Act
        recipeService.depleteForOrderItem(orderItem);

        // Assert
        verify(ingredientService).updateStock(
                eq(ingredientId),
                argThat(bd -> bd.compareTo(BigDecimal.valueOf(-3.0)) == 0),
                eq(InventoryTransactionType.SALE),
                anyString(),
                eq(orderItem.getId())
        );
    }

    @Test
    void depleteForOrderItem_respectsYieldPercentage() {
        // Arrange
        MenuItem menuItem = new MenuItem();
        menuItem.setId(menuItemId);
        
        OrderItem orderItem = new OrderItem();
        orderItem.setId(UUID.randomUUID());
        orderItem.setMenuItem(menuItem);
        orderItem.setQuantity(1);
        
        Recipe recipe = new Recipe();
        
        RawIngredient ingredient = new RawIngredient();
        ingredient.setId(ingredientId);
        ingredient.setYieldPct(BigDecimal.valueOf(0.5)); // 50% yield
        
        RecipeIngredient ri = new RecipeIngredient();
        ri.setRecipe(recipe);
        ri.setIngredient(ingredient);
        ri.setQuantity(BigDecimal.valueOf(1.0)); // 1.0 unit required in plate
        
        when(recipeRepository.findLatestByMenuItem(menuItem)).thenReturn(Optional.of(recipe));
        when(recipeIngredientRepository.findByRecipe(recipe)).thenReturn(List.of(ri));

        // Act
        recipeService.depleteForOrderItem(orderItem);

        // Assert
        // Actual stock removed = Required / Yield = 1.0 / 0.5 = 2.0
        verify(ingredientService).updateStock(
                eq(ingredientId),
                argThat(bd -> bd.compareTo(BigDecimal.valueOf(-2.0)) == 0),
                eq(InventoryTransactionType.SALE),
                anyString(),
                eq(orderItem.getId())
        );
    }

    @Test
    void depleteForOrderItem_depletesSubRecipeRecursively() {
        // Arrange
        MenuItem menuItem = new MenuItem();
        menuItem.setId(menuItemId);
        
        OrderItem orderItem = new OrderItem();
        orderItem.setId(UUID.randomUUID());
        orderItem.setMenuItem(menuItem);
        orderItem.setQuantity(1);
        
        Recipe menuItemRecipe = new Recipe();
        
        mls.sho.dms.entity.inventory.SubRecipe subRecipe = new mls.sho.dms.entity.inventory.SubRecipe();
        subRecipe.setId(UUID.randomUUID());
        subRecipe.setName("Tomato Sauce");
        
        RecipeIngredient ri = new RecipeIngredient();
        ri.setRecipe(menuItemRecipe);
        ri.setSubRecipe(subRecipe);
        ri.setQuantity(BigDecimal.valueOf(0.5)); // 0.5 units of sauce per item
        
        when(recipeRepository.findLatestByMenuItem(menuItem)).thenReturn(Optional.of(menuItemRecipe));
        when(recipeIngredientRepository.findByRecipe(menuItemRecipe)).thenReturn(List.of(ri));

        // Act
        recipeService.depleteForOrderItem(orderItem);

        // Assert
        verify(batchService).depleteSubRecipe(
                eq(subRecipe.getId()),
                eq(BigDecimal.valueOf(0.5)),
                eq(orderItem.getId())
        );
    }
}
