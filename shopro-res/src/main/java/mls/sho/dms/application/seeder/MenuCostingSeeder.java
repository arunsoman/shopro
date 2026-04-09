package mls.sho.dms.application.seeder;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.costing.repository.MenuCostGroupRepository;
import mls.sho.dms.application.costing.repository.RecipeRepository;
import mls.sho.dms.application.pos.repository.MenuItemRepository;
import mls.sho.dms.application.pos.repository.RestaurantRepository;
import mls.sho.dms.application.inventory.repository.IngredientRepository;
import mls.sho.dms.entity.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

/**
 * Seeds Menu Cost Groups and Menu Items for Restaurant ID 1 (Afghan Cuisine).
 * Implements dynamic pricing: Cost + (15-25% Margin) + 10% Tax.
 */
@Component
@RequiredArgsConstructor
public class MenuCostingSeeder implements CommandLineRunner {

    private final MenuCostGroupRepository groupRepository;
    private final MenuItemRepository itemRepository;
    private final RestaurantRepository restaurantRepository;
    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;

    private static final java.math.BigDecimal TAX_RATE = new java.math.BigDecimal("0.10"); // 10% Tax
    private final java.util.Random random = new java.util.Random();

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        Restaurant res = restaurantRepository.findById(1L).orElse(null);
        if (res == null) return;

        // 1. SEED GROUPS
        MenuCostGroup mains = createGroup(res, "Mains — Afghan Classics", 1, "0.28");
        MenuCostGroup kebabs = createGroup(res, "Skewers & Kebabs", 2, "0.32");
        MenuCostGroup sides = createGroup(res, "Sides & Naan", 3, "0.15");
        MenuCostGroup beverages = createGroup(res, "Beverages", 4, "0.10");

        // Load all ingredients for lookup
        java.util.Map<String, Ingredient> ingMap = ingredientRepository.findAllByRestaurantId(res.getId()).stream()
                .collect(java.util.stream.Collectors.toMap(Ingredient::getItemCode, i -> i));

        // 2. SEED ITEMS WITH DYNAMIC PRICING
        createItem(res, mains, "MI-01", "Kabuli Pulao (Lamb)", 1, "https://images.unsplash.com/photo-1512132411229-c30391241dd8?w=800&q=80",
                Map.of("DG-01", "0.30", "PR-01", "0.25", "PRD-04", "0.10", "NT-03", "0.05"), ingMap, "AUTHENTIC KABULI PULAO");

        createItem(res, mains, "MI-02", "Lamb Karahi (Family Style)", 2, "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80",
                Map.of("PR-02", "0.50", "PRD-02", "0.30", "PRD-07", "0.05"), ingMap, "KABULI LAMB KARAHI");

        createItem(res, mains, "MI-03", "Mantu (Steamed Dumplings)", 3, "https://images.unsplash.com/photo-1534422298391-e4f8c170db06?w=800&q=80",
                Map.of("DG-02", "0.15", "PR-04", "0.20", "MS-01", "0.05"), ingMap);

        createItem(res, mains, "MI-04", "Ashak (Leek Dumplings)", 4, "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=800&q=80",
                Map.of("PRD-06", "0.20", "PR-04", "0.10", "DG-02", "0.15", "MS-01", "0.05"), ingMap, "ASHAK (LEEK DUMPLINGS)");

        createItem(res, mains, "MI-05", "Kabuli Chicken Palaw", 5, "https://images.unsplash.com/photo-1599481238640-4c1288750d7a?w=800&q=80",
                Map.of("DG-01", "0.30", "PR-06", "0.25", "PRD-04", "0.10", "NT-03", "0.05"), ingMap, "KABULI CHICKEN PALAW");

        createItem(res, mains, "MI-06", "Kofta Challow (Meatballs)", 6, "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&q=80",
                Map.of("PR-04", "0.20", "DG-01", "0.30", "PRD-02", "0.10"), ingMap, "KOFTA CHALLOW (MEATBALLS)");

        createItem(res, mains, "MI-07", "Bamiya (Okra Stew)", 7, "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
                Map.of("PRD-11", "0.30", "PRD-02", "0.15", "PRD-01", "0.10"), ingMap, "BAMIYA (OKRA STEW)");

        createItem(res, kebabs, "KB-01", "Chopan Kebab (Ribs)", 1, "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
                Map.of("PR-07", "0.40", "PRD-07", "0.02"), ingMap);

        createItem(res, kebabs, "KB-02", "Chicken Tikka (Herat Style)", 2, "https://images.unsplash.com/photo-1599481238640-4c1288750d7a?w=800&q=80",
                Map.of("PR-06", "0.30", "MS-01", "0.05", "SP-05", "0.01"), ingMap, "CHICKEN TIKKA (HERAT STYLE)");

        createItem(res, kebabs, "KB-03", "Shami Kebab (Minced Beef)", 3, null,
                Map.of("PR-04", "0.25", "PRD-01", "0.05"), ingMap);

        createItem(res, sides, "SD-01", "Borani Banjan (Eggplant)", 1, null,
                Map.of("PRD-09", "0.30", "PRD-02", "0.10", "MS-01", "0.05"), ingMap);

        createItem(res, sides, "SD-02", "Gandana Sabzi (Leeks)", 2, null,
                Map.of("PRD-06", "0.40", "PRD-05", "0.20"), ingMap, "GANDANA (LEEK) SABZI");

        createItem(res, sides, "SD-03", "Fresh Tandoori Naan", 3, null,
                Map.of("DG-02", "0.20", "DG-09", "0.01"), ingMap);

        createItem(res, sides, "SD-04", "Bolani (Potato Stuffed)", 4, null,
                Map.of("PRD-03", "0.20", "PRD-06", "0.10", "DG-02", "0.15"), ingMap, "BOLANI (STUFFED FLATBREAD)");

        createItem(res, beverages, "BV-01", "Afghan Saffron Tea", 1, null,
                Map.of("DG-10", "0.05", "SP-05", "0.01"), ingMap);

        createItem(res, beverages, "BV-02", "Dogh (Yogurt Drink)", 2, null,
                Map.of("MS-01", "0.20", "PRD-13", "0.01"), ingMap);

        System.out.println(">>> SEEDED EXPANDED AFGHAN MENU WITH DYNAMIC PRICING");
    }

    private MenuCostGroup createGroup(Restaurant res, String name, int order, String targetFc) {
        return groupRepository.findByNameAndRestaurantId(name, res.getId())
                .orElseGet(() -> {
                    MenuCostGroup group = new MenuCostGroup();
                    group.setRestaurant(res);
                    group.setName(name);
                    group.setDisplayOrder(order);
                    group.setTargetFoodCostPct(new java.math.BigDecimal(targetFc));
                    return groupRepository.save(group);
                });
    }

    private void createItem(Restaurant res, MenuCostGroup group, String posId, String name, int order, String img,
                          java.util.Map<String, String> ingredientQtys, java.util.Map<String, Ingredient> ingMap) {
        createItem(res, group, posId, name, order, img, ingredientQtys, ingMap, null);
    }

    private void createItem(Restaurant res, MenuCostGroup group, String posId, String name, int order, String img,
                          java.util.Map<String, String> ingredientQtys, java.util.Map<String, Ingredient> ingMap, String recipeName) {
        
        MenuItem item = itemRepository.findByPosIdAndRestaurantId(posId, res.getId())
                .orElse(new MenuItem());
        
        item.setRestaurant(res);
        item.setGroup(group);
        item.setPosId(posId);
        item.setName(name);
        item.setDisplayOrder(order);
        item.setImageUrl(img);
        item.setPlateCost(new java.math.BigDecimal("0.50")); // Standard garnish/plate cost

        // 1. Calculate Total Ingredient Cost
        java.math.BigDecimal totalCost = item.getPlateCost();
        
        // Create a new Recipe for this Menu Item
        Recipe recipe = item.getRecipes().stream()
                .filter(r -> r.getName().equals(name + " Default Recipe"))
                .findFirst()
                .orElse(new Recipe());
        
        recipe.setRestaurant(res);
        recipe.setMenuItem(item);
        recipe.setName(name + " Default Recipe");
        recipe.setRecipeType(mls.sho.dms.common.enums.RecipeType.PLATE);
        recipe.setStation(mls.sho.dms.common.enums.KitchenStationType.LINE_COOK); // Fixed
        recipe.getIngredientLines().clear();

        int lineNumber = 1;
        for (java.util.Map.Entry<String, String> entry : ingredientQtys.entrySet()) {
            Ingredient ing = ingMap.get(entry.getKey());
            if (ing != null) {
                java.math.BigDecimal qty = new java.math.BigDecimal(entry.getValue());
                
                // Cost per RU = PurchasePrice / (uPerPu * yield)
                java.math.BigDecimal unitCost = ing.getPurchaseUnitPrice()
                        .divide(ing.getRuPerPu().multiply(ing.getYieldPct()), 4, java.math.RoundingMode.HALF_UP);
                
                totalCost = totalCost.add(unitCost.multiply(qty));

                RecipeIngredientLine line = new RecipeIngredientLine();
                line.setRecipe(recipe);
                line.setIngredient(ing);
                line.setQuantityRu(qty);
                line.setLineNumber(lineNumber++);
                line.setRecipeUnit(ing.getRecipeUnit());
                recipe.getIngredientLines().add(line);
            }
        }

        // 2. Dynamic Pricing Logic: Cost + (15-25% Margin) + 10% Tax
        double margin = 0.15 + (random.nextDouble() * 0.10); // Random 15-25%
        java.math.BigDecimal priceWithMargin = totalCost.multiply(java.math.BigDecimal.valueOf(1 + margin));
        java.math.BigDecimal finalPrice = priceWithMargin.multiply(java.math.BigDecimal.valueOf(1).add(TAX_RATE));
        
        item.setSellPriceBuffer(finalPrice.setScale(2, java.math.RoundingMode.HALF_UP));
        
        if (item.getSellPriceBuffer().compareTo(java.math.BigDecimal.ZERO) > 0) {
            item.setTargetFoodCostPct(totalCost.divide(item.getSellPriceBuffer(), 4, java.math.RoundingMode.HALF_UP));
        } else {
            item.setTargetFoodCostPct(new java.math.BigDecimal("0.30"));
        }

        item.getRecipes().clear();
        item.getRecipes().add(recipe);
        
        itemRepository.save(item);
    }
}
