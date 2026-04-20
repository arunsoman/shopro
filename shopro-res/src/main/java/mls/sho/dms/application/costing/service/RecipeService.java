package mls.sho.dms.application.costing.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.costing.dto.RecipeDTO;
import mls.sho.dms.application.costing.repository.RecipeRepository;
import mls.sho.dms.common.util.ConversionFunctions;
import mls.sho.dms.application.costing.entity.Recipe;
import mls.sho.dms.application.costing.entity.RecipeIngredientLine;
import mls.sho.dms.application.costing.dto.RecipeIngredientLineDTO;
import mls.sho.dms.application.costing.dto.RecipeProcedureStepDTO;
import mls.sho.dms.application.inventory.repository.IngredientRepository;
import mls.sho.dms.application.costing.entity.RecipeProcedureStep;
import mls.sho.dms.entity.Restaurant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecipeService {

    @Transactional(readOnly = true)
    public List<RecipeDTO> getRecipes(Long restaurantId, Boolean active) {
        List<Recipe> recipes;
        if (active != null) {
            // Note: repository needs to have these methods or use findByRestaurantId and filter
            recipes = repository.findAllByRestaurantId(restaurantId).stream()
                    .filter(r -> r.isActive() == active)
                    .collect(Collectors.toList());
        } else {
            recipes = repository.findAllByRestaurantId(restaurantId);
        }
        return recipes.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public RecipeDTO toDTO(Recipe entity) {
        RecipeDTO dto = new RecipeDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setRecipeType(entity.getRecipeType());
        if (entity.getMenuItem() != null) {
            dto.setMenuItemId(entity.getMenuItem().getId());
        }
        dto.setStation(entity.getStation());
        dto.setShelfLife(entity.getShelfLife());
        dto.setToolsEquipment(entity.getToolsEquipment());
        dto.setPositionNotes(entity.getPositionNotes());
        dto.setYieldQuantity(entity.getYieldQuantity());
        dto.setYieldUnit(entity.getYieldUnit());
        dto.setActive(entity.isActive());

        if (entity.getIngredientLines() != null) {
            dto.setIngredientLines(entity.getIngredientLines().stream()
                    .map(this::toLineDTO)
                    .collect(Collectors.toList()));
        }

        if (entity.getProcedureSteps() != null) {
            dto.setProcedureSteps(entity.getProcedureSteps().stream()
                    .map(this::toStepDTO)
                    .collect(Collectors.toList()));
        }

        // Calculate costs
        BigDecimal total = calculateTotalRecipeCost(entity);
        dto.setTotalCost(total);
        if (entity.getYieldQuantity() != null && entity.getYieldQuantity().compareTo(BigDecimal.ZERO) > 0) {
            dto.setCostPerUnit(total.divide(entity.getYieldQuantity(), 4, java.math.RoundingMode.HALF_UP));
        }

        return dto;
    }

    private RecipeIngredientLineDTO toLineDTO(RecipeIngredientLine line) {
        RecipeIngredientLineDTO dto = new RecipeIngredientLineDTO();
        dto.setId(line.getId());
        dto.setIngredientId(line.getIngredient().getId());
        dto.setDescription(line.getIngredient().getDescription());
        dto.setQuantity(line.getQuantityRu());
        dto.setRecipeUnit(line.getRecipeUnit());
        dto.setRuCost(line.getIngredient().getPurchaseUnitPrice()); // Simplified
        dto.setLineTotal(dto.getQuantity().multiply(dto.getRuCost()));
        return dto;
    }

    private RecipeProcedureStepDTO toStepDTO(RecipeProcedureStep step) {
        RecipeProcedureStepDTO dto = new RecipeProcedureStepDTO();
        dto.setId(step.getId());
        dto.setStepNumber(step.getStepNumber());
        dto.setInstruction(step.getInstruction());
        dto.setCriticalControlPoint(step.isCriticalControlPoint());
        return dto;
    }

    private final RecipeRepository repository;
    private final IngredientRepository ingredientRepository;
    private final mls.sho.dms.application.analytics.service.ExperimentService experimentService;

    @Transactional
    public void recordYieldMetric(Long restaurantId, Long recipeId, java.math.BigDecimal actualYield) {
        Recipe recipe = repository.findById(recipeId).orElseThrow();
        java.math.BigDecimal standardYield = recipe.getYieldQuantity();
        
        if (standardYield == null || standardYield.compareTo(java.math.BigDecimal.ZERO) == 0) return;
        
        java.math.BigDecimal variance = actualYield.subtract(standardYield)
            .divide(standardYield, 4, java.math.RoundingMode.HALF_UP)
            .multiply(new java.math.BigDecimal("100"));
            
        experimentService.recordMetric(restaurantId, "RECIPE_YIELD_VARIANCE", variance, 
            java.util.Map.of("recipeId", recipeId.toString(), "actual", actualYield.toString()));
    }

    @Transactional(readOnly = true)
    public RecipeDTO getRecipeDetail(Long restaurantId, Long id) {
        Recipe recipe = repository.findById(id)
                .filter(r -> r.getRestaurant().getId().equals(restaurantId))
                .orElseThrow(() -> new RuntimeException("Recipe not found or access denied"));
        return toDTO(recipe);
    }

    @Transactional
    public RecipeDTO createRecipe(Long restaurantId, RecipeDTO dto) {
        Recipe recipe = new Recipe();
        recipe.setRestaurant(new Restaurant()); 
        recipe.getRestaurant().setId(restaurantId);
        updateEntityFromDTO(recipe, dto);
        return toDTO(repository.save(recipe));
    }

    @Transactional
    public RecipeDTO updateRecipe(Long restaurantId, Long id, RecipeDTO dto) {
        Recipe recipe = repository.findById(id)
                .filter(r -> r.getRestaurant().getId().equals(restaurantId))
                .orElseThrow(() -> new RuntimeException("Recipe not found or access denied"));
        updateEntityFromDTO(recipe, dto);
        return toDTO(repository.save(recipe));
    }

    private void updateEntityFromDTO(Recipe recipe, RecipeDTO dto) {
        recipe.setName(dto.getName());
        recipe.setRecipeType(dto.getRecipeType());
        recipe.setStation(dto.getStation());
        recipe.setShelfLife(dto.getShelfLife());
        recipe.setToolsEquipment(dto.getToolsEquipment());
        recipe.setPositionNotes(dto.getPositionNotes());
        recipe.setYieldQuantity(dto.getYieldQuantity());
        recipe.setYieldUnit(dto.getYieldUnit());
        recipe.setActive(dto.isActive());

        // Update lines
        recipe.getIngredientLines().clear();
        if (dto.getIngredientLines() != null) {
            int lineNo = 1;
            for (RecipeIngredientLineDTO lineDTO : dto.getIngredientLines()) {
                RecipeIngredientLine line = new RecipeIngredientLine();
                line.setRecipe(recipe);
                line.setIngredient(ingredientRepository.findById(lineDTO.getIngredientId()).orElseThrow());
                line.setQuantityRu(lineDTO.getQuantity());
                line.setRecipeUnit(lineDTO.getRecipeUnit());
                line.setLineNumber(lineNo++);
                recipe.getIngredientLines().add(line);
            }
        }

        // Update steps
        recipe.getProcedureSteps().clear();
        if (dto.getProcedureSteps() != null) {
            for (RecipeProcedureStepDTO stepDTO : dto.getProcedureSteps()) {
                RecipeProcedureStep step = new RecipeProcedureStep();
                step.setRecipe(recipe);
                step.setStepNumber(stepDTO.getStepNumber());
                step.setInstruction(stepDTO.getInstruction());
                step.setCriticalControlPoint(stepDTO.isCriticalControlPoint());
                recipe.getProcedureSteps().add(step);
            }
        }
    }

    private BigDecimal calculateTotalRecipeCost(Recipe entity) {
        if (entity.getIngredientLines() == null) return BigDecimal.ZERO;
        return entity.getIngredientLines().stream()
                .map(l -> l.getQuantityRu().multiply(l.getIngredient().getPurchaseUnitPrice())) // Simplified
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transactional
    public Recipe saveRecipe(Recipe recipe) {
        return repository.save(recipe);
    }

    @Transactional(readOnly = true)
    public Recipe getRecipe(Long id) {
        return repository.findById(id).orElseThrow();
    }

    @Transactional
    public void deleteRecipe(Long id) {
        repository.deleteById(id);
    }

    public BigDecimal calculateRecipeCostPerYieldUnit(Recipe recipe) {
        List<BigDecimal> extensions = recipe.getIngredientLines().stream()
                .map(line -> ConversionFunctions.calcRecipeLineExtension(
                        line.getQuantityRu(),
                        line.getIngredient().getPurchaseUnitPrice() 
                ))
                .collect(Collectors.toList());

        BigDecimal totalCost = ConversionFunctions.calcTotalBatchCost(extensions);
        return ConversionFunctions.calcBatchCostPerYieldUnit(totalCost, recipe.getYieldQuantity());
    }
}
