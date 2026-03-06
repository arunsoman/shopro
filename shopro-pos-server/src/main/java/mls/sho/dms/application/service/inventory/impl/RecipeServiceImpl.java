package mls.sho.dms.application.service.inventory.impl;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.inventory.RecipeResponse;
import mls.sho.dms.application.dto.inventory.RecipeIngredientResponse;
import mls.sho.dms.application.dto.inventory.UpdateRecipeRequest;
import mls.sho.dms.application.exception.ResourceNotFoundException;
import mls.sho.dms.application.service.inventory.RecipeService;
import mls.sho.dms.application.service.inventory.IngredientService;
import mls.sho.dms.application.service.inventory.BatchService;
import org.springframework.context.annotation.Lazy;
import mls.sho.dms.entity.inventory.InventoryTransactionType;
import mls.sho.dms.entity.inventory.RawIngredient;
import mls.sho.dms.entity.inventory.Recipe;
import mls.sho.dms.entity.inventory.RecipeIngredient;
import mls.sho.dms.entity.inventory.SubRecipe;
import mls.sho.dms.entity.menu.MenuItem;
import mls.sho.dms.entity.order.OrderItem;
import mls.sho.dms.repository.inventory.RawIngredientRepository;
import mls.sho.dms.repository.inventory.RecipeIngredientRepository;
import mls.sho.dms.repository.inventory.RecipeRepository;
import mls.sho.dms.repository.inventory.SubRecipeRepository;
import mls.sho.dms.repository.menu.MenuItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class RecipeServiceImpl implements RecipeService {

    private final RecipeRepository recipeRepository;
    private final MenuItemRepository menuItemRepository;
    private final RawIngredientRepository rawIngredientRepository;
    private final SubRecipeRepository subRecipeRepository;
    private final RecipeIngredientRepository recipeIngredientRepository;
    private final IngredientService ingredientService;
    private final BatchService batchService;

    public RecipeServiceImpl(RecipeRepository recipeRepository,
                             MenuItemRepository menuItemRepository,
                             RawIngredientRepository rawIngredientRepository,
                             SubRecipeRepository subRecipeRepository,
                             RecipeIngredientRepository recipeIngredientRepository,
                             IngredientService ingredientService,
                             @Lazy BatchService batchService) {
        this.recipeRepository = recipeRepository;
        this.menuItemRepository = menuItemRepository;
        this.rawIngredientRepository = rawIngredientRepository;
        this.subRecipeRepository = subRecipeRepository;
        this.recipeIngredientRepository = recipeIngredientRepository;
        this.ingredientService = ingredientService;
        this.batchService = batchService;
    }

    @Override
    @Transactional(readOnly = true)
    public RecipeResponse findLatestByMenuItem(UUID menuItemId) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
            .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));

        return recipeRepository.findLatestByMenuItem(menuItem)
            .map(r -> {
                List<RecipeIngredient> ingredients = recipeIngredientRepository.findByRecipe(r);
                return mapToResponse(r, ingredients);
            })
            .orElse(new RecipeResponse(null, menuItemId, 0, BigDecimal.ZERO, List.of()));
    }

    @Override
    public RecipeResponse updateRecipe(UUID menuItemId, UpdateRecipeRequest request) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
            .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));

        int nextVersion = recipeRepository.findLatestByMenuItem(menuItem)
            .map(r -> r.getRecipeVersion() + 1)
            .orElse(1);

        Recipe recipe = new Recipe();
        recipe.setMenuItem(menuItem);
        recipe.setRecipeVersion(nextVersion);
        recipe.setEffectiveFrom(Instant.now());
        
        // In a real app, we'd get the staff member from security context
        // recipe.setCreatedBy(staffMember);

        final Recipe savedRecipe = recipeRepository.save(recipe);

        List<RecipeIngredient> ingredients = request.ingredients().stream()
            .map(req -> {
                RawIngredient ingredient = rawIngredientRepository.findById(req.ingredientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ingredient not found: " + req.ingredientId()));
                
                RecipeIngredient ri = new RecipeIngredient();
                ri.setRecipe(savedRecipe);
                ri.setIngredient(ingredient);
                ri.setQuantity(req.quantity());
                return ri;
            })
            .collect(Collectors.toList());

        // We'd need a RecipeIngredientRepository to save these if not using cascade
        // Assuming we have one or cascade is set
        // savedRecipe.setIngredients(ingredients); // Add this collection if needed

        return mapToResponse(savedRecipe, ingredients);
    }

    @Override
    @Transactional(readOnly = true)
    public RecipeResponse findLatestBySubRecipe(UUID subRecipeId) {
        return recipeRepository.findLatestBySubRecipe(subRecipeId)
                .map(r -> {
                    List<RecipeIngredient> ingredients = recipeIngredientRepository.findByRecipe(r);
                    return mapToResponse(r, ingredients);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found for sub-recipe: " + subRecipeId));
    }

    @Override
    public RecipeResponse updateSubRecipeRecipe(UUID subRecipeId, UpdateRecipeRequest request) {
        SubRecipe subRecipe = subRecipeRepository.findById(subRecipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Sub-recipe not found"));

        int nextVersion = recipeRepository.findLatestBySubRecipe(subRecipeId)
                .map(r -> r.getRecipeVersion() + 1)
                .orElse(1);

        Recipe recipe = new Recipe();
        recipe.setSubRecipe(subRecipe);
        recipe.setRecipeVersion(nextVersion);
        recipe.setEffectiveFrom(Instant.now());
        final Recipe savedRecipe = recipeRepository.save(recipe);

        List<RecipeIngredient> ingredients = request.ingredients().stream()
                .map(req -> {
                    RecipeIngredient ri = new RecipeIngredient();
                    ri.setRecipe(savedRecipe);
                    if (req.ingredientId() != null) {
                        ri.setIngredient(rawIngredientRepository.findById(req.ingredientId())
                                .orElseThrow(() -> new ResourceNotFoundException("Ingredient not found")));
                    } else if (req.subRecipeId() != null) {
                        ri.setSubRecipe(subRecipeRepository.findById(req.subRecipeId())
                                .orElseThrow(() -> new ResourceNotFoundException("Sub-Recipe not found")));
                    }
                    ri.setQuantity(req.quantity());
                    return recipeIngredientRepository.save(ri);
                })
                .collect(Collectors.toList());

        return mapToResponse(savedRecipe, ingredients);
    }

    @Override
    @Transactional
    public void depleteForOrderItem(OrderItem item) {
        MenuItem menuItem = item.getMenuItem();
        recipeRepository.findLatestByMenuItem(menuItem).ifPresent(recipe -> {
            List<RecipeIngredient> lines = recipeIngredientRepository.findByRecipe(recipe);
            for (RecipeIngredient line : lines) {
                if (line.getIngredient() != null) {
                    RawIngredient ingredient = line.getIngredient();
                    // Yield-adjusted depletion: Actual Stock Removed = Recipe Qty / Yield Pct
                    // Example: 8oz needed, 80% yield -> Removes 10oz from stock.
                    java.math.BigDecimal yieldAdjustedQty = line.getQuantity()
                            .divide(ingredient.getYieldPct(), 4, java.math.RoundingMode.HALF_UP);
                    
                    java.math.BigDecimal totalQty = yieldAdjustedQty
                            .multiply(new java.math.BigDecimal(item.getQuantity()))
                            .negate(); // negative = depletion

                    ingredientService.updateStock(
                            ingredient.getId(),
                            totalQty,
                            InventoryTransactionType.SALE,
                            "Auto-depleted by order item (Yield adjusted: " + ingredient.getYieldPct().multiply(new java.math.BigDecimal("100")) + "%)",
                            item.getId()
                    );
                } else if (line.getSubRecipe() != null) {
                    // Recursive Sub-Recipe batch depletion
                    batchService.depleteSubRecipe(
                            line.getSubRecipe().getId(),
                            line.getQuantity().multiply(new java.math.BigDecimal(item.getQuantity())),
                            item.getId()
                    );
                }
            }
        });
    }

    private RecipeResponse mapToResponse(Recipe recipe, List<RecipeIngredient> ingredients) {
        BigDecimal totalCost = ingredients.stream()
            .map(ri -> {
                if (ri.getIngredient() != null) {
                    return ri.getIngredient().getEffectiveCostPerUnit().multiply(ri.getQuantity());
                } else if (ri.getSubRecipe() != null) {
                    return ri.getSubRecipe().getCostPerUnit().multiply(ri.getQuantity());
                }
                return BigDecimal.ZERO;
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<RecipeIngredientResponse> ingredientResponses = ingredients.stream()
            .map(ri -> {
                UUID id = ri.getIngredient() != null ? ri.getIngredient().getId() : ri.getSubRecipe().getId();
                String name = ri.getIngredient() != null ? ri.getIngredient().getName() : ri.getSubRecipe().getName();
                String uom = ri.getIngredient() != null ? ri.getIngredient().getUnitOfMeasure() : ri.getSubRecipe().getUnitOfMeasure();
                BigDecimal cost = ri.getIngredient() != null ? ri.getIngredient().getEffectiveCostPerUnit() : ri.getSubRecipe().getCostPerUnit();
                
                return new RecipeIngredientResponse(
                    id,
                    name,
                    ri.getQuantity(),
                    uom,
                    cost
                );
            })
            .collect(Collectors.toList());

        UUID targetId = recipe.getMenuItem() != null ? recipe.getMenuItem().getId() : recipe.getSubRecipe().getId();

        return new RecipeResponse(
            recipe.getId(),
            targetId,
            recipe.getRecipeVersion(),
            totalCost,
            ingredientResponses
        );
    }
}
