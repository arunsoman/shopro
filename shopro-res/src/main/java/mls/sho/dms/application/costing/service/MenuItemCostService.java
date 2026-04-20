package mls.sho.dms.application.costing.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.costing.dto.CostCardDTO;
import mls.sho.dms.application.costing.dto.CostingLineDTO;
import mls.sho.dms.application.costing.dto.MenuItemDTO;
import mls.sho.dms.application.costing.repository.RecipeLineRepository;
import mls.sho.dms.application.costing.repository.RecipeRepository;
import mls.sho.dms.application.pos.repository.MenuItemRepository;
import mls.sho.dms.application.inventory.repository.IngredientRepository;
import mls.sho.dms.common.enums.RecipeType;
import mls.sho.dms.common.util.ConversionFunctions;
import mls.sho.dms.application.costing.entity.MenuCostGroup;
import mls.sho.dms.application.pos.entity.MenuItem;
import mls.sho.dms.application.costing.entity.Recipe;
import mls.sho.dms.application.costing.entity.RecipeIngredientLine;
import mls.sho.dms.entity.Restaurant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuItemCostService {

    private final MenuItemRepository repository;
    private final RecipeService recipeService;
    private final RecipeLineRepository lineRepository;
    private final IngredientRepository ingredientRepository;
    private final RecipeRepository recipeRepository;

    @Transactional(readOnly = true)
    public List<MenuItemDTO> getMenuItems(Long restaurantId) {
        return repository.findAllByRestaurantId(restaurantId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public MenuItemDTO toDTO(MenuItem entity) {
        MenuItemDTO dto = new MenuItemDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setPosId(entity.getPosId());
        dto.setSellPriceBuffer(entity.getSellPriceBuffer());
        dto.setPlateCost(entity.getPlateCost());
        dto.setTargetFoodCostPct(entity.getTargetFoodCostPct());
        dto.setActive(entity.isActive());
        if (entity.getGroup() != null) {
            dto.setGroupId(entity.getGroup().getId());
            dto.setGroupName(entity.getGroup().getName());
        }
        return dto;
    }

    @Transactional
    public MenuItemDTO updateMenuItem(Long id, MenuItemDTO dto) {
        MenuItem item = getMenuItem(id);
        item.setName(dto.getName());
        item.setSellPriceBuffer(dto.getSellPriceBuffer());
        item.setPlateCost(dto.getPlateCost());
        item.setTargetFoodCostPct(dto.getTargetFoodCostPct());
        item.setActive(dto.isActive());
        return toDTO(repository.save(item));
    }

    @Transactional
    public List<CostingLineDTO> updateCostingLines(Long id, List<CostingLineDTO> lineDtos) {
        MenuItem item = getMenuItem(id);
        
        // 1. Get or Create active PLATE recipe
        Recipe recipe = item.getRecipes().stream()
                .filter(r -> r.getRecipeType() == RecipeType.PLATE)
                .findFirst()
                .orElseGet(() -> {
                    Recipe newRecipe = new Recipe();
                    newRecipe.setMenuItem(item);
                    newRecipe.setRestaurant(item.getRestaurant());
                    newRecipe.setName(item.getName() + " Recipe");
                    newRecipe.setRecipeType(RecipeType.PLATE);
                    newRecipe.setStation(mls.sho.dms.common.enums.KitchenStationType.LINE_COOK);
                    return newRecipe;
                });

        // 2. Clear Existing Lines
        recipe.getIngredientLines().clear();
        
        // 3. Create New Lines (Single Level only, per user request)
        int lineNo = 1;
        for (CostingLineDTO dto : lineDtos) {
            RecipeIngredientLine line = new RecipeIngredientLine();
            line.setRecipe(recipe);
            line.setQuantityRu(dto.getQuantity());
            line.setRecipeUnit(dto.getUnit());
            line.setLineNumber(lineNo++);
            
            if (dto.getIngredientId() != null) {
                line.setIngredient(ingredientRepository.findById(dto.getIngredientId()).orElseThrow());
                recipe.getIngredientLines().add(line);
            }
        }
        
        item.getRecipes().add(recipe);
        repository.save(item);
        
        return getCostCard(id).getCostingLines();
    }

    @Transactional
    public MenuItemDTO createMenuItem(Long restaurantId, MenuItemDTO dto) {
        Restaurant restaurant = new Restaurant();
        restaurant.setId(restaurantId);

        MenuItem item = new MenuItem();
        item.setRestaurant(restaurant);
        item.setName(dto.getName());
        item.setSellPriceBuffer(dto.getSellPriceBuffer());
        item.setPlateCost(dto.getPlateCost());
        item.setTargetFoodCostPct(dto.getTargetFoodCostPct());
        item.setActive(true);

        if (dto.getGroupId() != null) {
            MenuCostGroup group = new MenuCostGroup();
            group.setId(dto.getGroupId());
            item.setGroup(group);
        }

        return toDTO(repository.save(item));
    }

    @Transactional
    public void deleteMenuItem(Long id) {
        repository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public MenuItem getMenuItem(Long id) {
        return repository.findById(id).orElseThrow();
    }

    @Transactional(readOnly = true)
    public CostCardDTO getCostCard(Long id) {
        MenuItem item = getMenuItem(id);
        CostCardDTO dto = new CostCardDTO();
        
        // Map Header
        dto.setId(item.getId());
        dto.setName(item.getName());
        dto.setPosId(item.getPosId());
        dto.setSellPriceBuffer(item.getSellPriceBuffer());
        dto.setPlateCost(item.getPlateCost());
        dto.setTargetFoodCostPct(item.getTargetFoodCostPct());
        dto.setActive(item.isActive());
        if (item.getGroup() != null) {
            dto.setGroupId(item.getGroup().getId());
            dto.setGroupName(item.getGroup().getName());
        }

        // Map Lines from the active PLATE recipe
        Recipe activeRecipe = item.getRecipes().stream()
                .filter(Recipe::isActive)
                .findFirst()
                .orElse(null);

        if (activeRecipe != null) {
            List<CostingLineDTO> lines = activeRecipe.getIngredientLines().stream()
                    .map(line -> {
                        CostingLineDTO lineDto = new CostingLineDTO();
                        lineDto.setId(line.getId());
                        lineDto.setQuantity(line.getQuantityRu());
                        lineDto.setUnit(line.getRecipeUnit());
                        
                        BigDecimal unitCost;
                        if (line.getIngredient() != null) {
                            lineDto.setIngredientId(line.getIngredient().getId());
                            lineDto.setDescription(line.getIngredient().getDescription());
                            unitCost = line.getIngredient().getPurchaseUnitPrice();
                        } else {
                            unitCost = BigDecimal.ZERO;
                        }
                        
                        lineDto.setUnitCost(unitCost);
                        lineDto.setLineTotal(ConversionFunctions.calcRecipeLineExtension(line.getQuantityRu(), unitCost));
                        return lineDto;
                    })
                    .collect(Collectors.toList());
            dto.setCostingLines(lines);
        }

        dto.setPlateCost(item.getPlateCost() != null ? item.getPlateCost() : BigDecimal.ZERO);
        dto.setTotalCost(calculateMenuItemTotalCost(item));
        
        if (dto.getSellPriceBuffer() != null && dto.getSellPriceBuffer().compareTo(BigDecimal.ZERO) > 0) {
            dto.setFoodCostPct(dto.getTotalCost().divide(dto.getSellPriceBuffer(), 4, java.math.RoundingMode.HALF_UP).multiply(new BigDecimal("100")));
            dto.setGpDollars(dto.getSellPriceBuffer().subtract(dto.getTotalCost()));
        } else {
            dto.setFoodCostPct(BigDecimal.ZERO);
            dto.setGpDollars(BigDecimal.ZERO.subtract(dto.getTotalCost()));
        }

        return dto;
    }

    public BigDecimal calculateMenuItemTotalCost(MenuItem menuItem) {
        Recipe activeRecipe = menuItem.getRecipes().stream()
                .filter(Recipe::isActive)
                .findFirst()
                .orElse(null);

        if (activeRecipe == null) return menuItem.getPlateCost() != null ? menuItem.getPlateCost() : BigDecimal.ZERO;

        List<BigDecimal> extensions = activeRecipe.getIngredientLines().stream()
                .map(line -> {
                    BigDecimal unitCost = BigDecimal.ZERO;
                    if (line.getIngredient() != null) {
                        unitCost = line.getIngredient().getPurchaseUnitPrice();
                    }
                    return ConversionFunctions.calcRecipeLineExtension(line.getQuantityRu(), unitCost);
                })
                .collect(Collectors.toList());

        return ConversionFunctions.calcMenuItemTotalCost(extensions, menuItem.getPlateCost());
    }
}
