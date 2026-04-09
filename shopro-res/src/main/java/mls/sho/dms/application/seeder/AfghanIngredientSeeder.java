package mls.sho.dms.application.seeder;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.inventory.repository.IngredientRepository;
import mls.sho.dms.application.pos.repository.RestaurantRepository;
import mls.sho.dms.application.costing.repository.RecipeRepository;
import mls.sho.dms.entity.*;
import mls.sho.dms.common.enums.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Seeds 50 common restaurant ingredients and 9 authentic recipes for Afghanistan (Restaurant ID 1).
 */
@Component
@RequiredArgsConstructor
public class AfghanIngredientSeeder implements CommandLineRunner {

    private final IngredientRepository ingredientRepository;
    private final RestaurantRepository restaurantRepository;
    private final RecipeRepository recipeRepository;
    private final mls.sho.dms.application.pos.repository.MenuItemRepository menuItemRepository;
    private final mls.sho.dms.application.costing.repository.MenuCostGroupRepository groupRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Find Restaurant 1
        Restaurant res = restaurantRepository.findById(1L).orElse(null);
        if (res == null) return;

        // 1. SEED INGREDIENTS (50 ITEMS)
        if (ingredientRepository.findByRestaurantIdAndItemCode(1L, "PR-01").isEmpty()) {
            seedIngredients(res);
        }

        // 2. SEED BATCH RECIPES (PREP ITEMS)
        if (recipeRepository.count() < 1) {
            seedRecipes(res);
        }

        // 3. SEED MENU ITEMS
        if (menuItemRepository.count() < 1) {
            seedMenuItems(res);
        }
    }

    private void seedIngredients(Restaurant res) {
        List<Ingredient> ingredients = new ArrayList<>();

        // Proteins
        ingredients.add(create(res, "PR-01", "Lamb Shoulder (Bone-in)", InventoryCategory.MEAT, PurchaseUnit.KG, RecipeUnit.KG, "25.00", "1", "0.75"));
        ingredients.add(create(res, "PR-02", "Lamb Leg (Skinned)", InventoryCategory.MEAT, PurchaseUnit.KG, RecipeUnit.KG, "28.50", "1", "0.85"));
        ingredients.add(create(res, "PR-03", "Beef Shank (Gousht-e-Mahee)", InventoryCategory.MEAT, PurchaseUnit.KG, RecipeUnit.KG, "18.00", "1", "0.80"));
        ingredients.add(create(res, "PR-04", "Beef Chuck (Minced/Keema)", InventoryCategory.MEAT, PurchaseUnit.KG, RecipeUnit.KG, "17.00", "1", "1.00"));
        ingredients.add(create(res, "PR-05", "Chicken Whole (Skin-on)", InventoryCategory.POULTRY, PurchaseUnit.KG, RecipeUnit.KG, "6.50", "1", "0.65"));
        ingredients.add(create(res, "PR-06", "Chicken Breast (Boneless)", InventoryCategory.POULTRY, PurchaseUnit.KG, RecipeUnit.KG, "9.50", "1", "1.00"));
        ingredients.add(create(res, "PR-07", "Lamb Chops (Kebab Style)", InventoryCategory.MEAT, PurchaseUnit.KG, RecipeUnit.KG, "32.00", "1", "0.90"));

        // Grains & Dry Goods
        ingredients.add(create(res, "DG-01", "Sela Rice (Long Grain)", InventoryCategory.GROCERY_DRY_GOODS, PurchaseUnit.BAG, RecipeUnit.KG, "75.00", "50", "1.00")); 
        ingredients.add(create(res, "DG-02", "Flour (Maida/White)", InventoryCategory.GROCERY_DRY_GOODS, PurchaseUnit.BAG, RecipeUnit.KG, "35.00", "50", "1.00"));
        ingredients.add(create(res, "DG-07", "Ghee (Clarified Butter)", InventoryCategory.DAIRY, PurchaseUnit.CAN, RecipeUnit.KG, "35.00", "5", "1.00"));
        ingredients.add(create(res, "DG-06", "Vegetable Oil (Dalda)", InventoryCategory.GROCERY_DRY_GOODS, PurchaseUnit.CAN, RecipeUnit.LITER, "24.00", "16", "1.00")); 

        // Produce
        ingredients.add(create(res, "PRD-01", "Kabul Onions (Yellow)", InventoryCategory.PRODUCE, PurchaseUnit.BAG, RecipeUnit.KG, "15.00", "20", "0.90"));
        ingredients.add(create(res, "PRD-02", "Tomatoes (Red Plum)", InventoryCategory.PRODUCE, PurchaseUnit.KG, RecipeUnit.KG, "1.20", "1", "0.95"));
        ingredients.add(create(res, "PRD-03", "Potatoes (Russet Style)", InventoryCategory.PRODUCE, PurchaseUnit.BAG, RecipeUnit.KG, "12.00", "20", "0.85"));
        ingredients.add(create(res, "PRD-04", "Carrots (Orange)", InventoryCategory.PRODUCE, PurchaseUnit.KG, RecipeUnit.KG, "0.80", "1", "0.80"));
        ingredients.add(create(res, "PRD-05", "Spinach (Fresh)", InventoryCategory.PRODUCE, PurchaseUnit.KG, RecipeUnit.KG, "1.50", "1", "0.65"));
        ingredients.add(create(res, "PRD-06", "Gandana (Leeks)", InventoryCategory.PRODUCE, PurchaseUnit.BUNCH, RecipeUnit.GRAM, "0.50", "300", "0.75"));
        ingredients.add(create(res, "PRD-07", "Garlic (Fresh)", InventoryCategory.PRODUCE, PurchaseUnit.KG, RecipeUnit.KG, "4.50", "1", "0.80"));
        ingredients.add(create(res, "PRD-11", "Okra (Bamiya)", InventoryCategory.PRODUCE, PurchaseUnit.KG, RecipeUnit.KG, "3.50", "1", "0.90"));
        ingredients.add(create(res, "PRD-14", "Green Chilies", InventoryCategory.PRODUCE, PurchaseUnit.KG, RecipeUnit.KG, "2.50", "1", "0.95"));

        // Spices & Nuts
        ingredients.add(create(res, "SP-01", "Cumin Seeds (Zira)", InventoryCategory.DRY_GOODS, PurchaseUnit.KG, RecipeUnit.GRAM, "18.00", "1000", "1.00"));
        ingredients.add(create(res, "SP-05", "Herat Saffron", InventoryCategory.DRY_GOODS, PurchaseUnit.KG, RecipeUnit.GRAM, "2500.00", "1000", "1.00"));
        ingredients.add(create(res, "SP-06", "Black Pepper", InventoryCategory.DRY_GOODS, PurchaseUnit.KG, RecipeUnit.GRAM, "12.00", "1000", "1.00"));
        ingredients.add(create(res, "NT-03", "Black Raisins", InventoryCategory.DRY_GOODS, PurchaseUnit.KG, RecipeUnit.KG, "14.00", "1", "1.00"));

        // Misc
        ingredients.add(create(res, "MS-01", "Chakka (Strained Yogurt)", InventoryCategory.DAIRY, PurchaseUnit.KG, RecipeUnit.KG, "6.00", "1", "1.00"));

        ingredientRepository.saveAll(ingredients);
    }

    private void seedRecipes(Restaurant res) {
        Map<String, Ingredient> ingMap = ingredientRepository.findAllByRestaurantId(res.getId()).stream()
                .collect(Collectors.toMap(Ingredient::getItemCode, i -> i));

        // 1. KABULI PULAO
        Recipe pulao = new Recipe();
        pulao.setRestaurant(res);
        pulao.setName("AUTHENTIC KABULI PULAO");
        pulao.setRecipeType(RecipeType.BATCH);
        pulao.setStation(KitchenStationType.SOUS_CHEF);
        pulao.setShelfLife(ShelfLife.ONE_DAY);
        pulao.setYieldQuantity(new BigDecimal("10"));
        pulao.setYieldUnit(RecipeUnit.EACH);
        pulao.setActive(true);

        addIngredientLine(pulao, ingMap.get("DG-01"), "5", RecipeUnit.KG, 1);
        addIngredientLine(pulao, ingMap.get("PR-01"), "3", RecipeUnit.KG, 2);
        addIngredientLine(pulao, ingMap.get("DG-07"), "0.5", RecipeUnit.KG, 3);
        addIngredientLine(pulao, ingMap.get("SP-05"), "2", RecipeUnit.GRAM, 4);

        addProcedureStep(pulao, 1, "Clean and soak Sela rice.", false);
        recipeRepository.save(pulao);

        // 2. LAMB KARAHI
        Recipe karahi = new Recipe();
        karahi.setRestaurant(res);
        karahi.setName("KABULI LAMB KARAHI");
        karahi.setRecipeType(RecipeType.BATCH);
        karahi.setStation(KitchenStationType.LINE_COOK);
        karahi.setYieldQuantity(new BigDecimal("5"));
        karahi.setYieldUnit(RecipeUnit.EACH);
        karahi.setActive(true);

        addIngredientLine(karahi, ingMap.get("PR-02"), "2.5", RecipeUnit.KG, 1);
        addIngredientLine(karahi, ingMap.get("PRD-02"), "1.5", RecipeUnit.KG, 2);
        recipeRepository.save(karahi);
    }

    private void seedMenuItems(Restaurant res) {
        MenuCostGroup afghanGroup = groupRepository.findAll().stream()
                .filter(g -> g.getName().equals("Authentic Afghan"))
                .findFirst()
                .orElseGet(() -> {
                    MenuCostGroup g = new MenuCostGroup();
                    g.setRestaurant(res);
                    g.setName("Authentic Afghan");
                    return groupRepository.save(g);
                });

        // We'll create a few sample menu items manually to avoid loop complexity
        createPlateItem(res, afghanGroup, "AFG-01", "Kabuli Pulao", "25.00", 15, "AUTHENTIC KABULI PULAO");
        createPlateItem(res, afghanGroup, "AFG-02", "Lamb Karahi", "28.00", 12, "KABULI LAMB KARAHI");
    }

    private void createPlateItem(Restaurant res, MenuCostGroup group, String posId, String name, String price, int prepTime, String sourceRecipeName) {
        MenuItem item = new MenuItem();
        item.setRestaurant(res);
        item.setGroup(group);
        item.setPosId(posId);
        item.setName(name);
        item.setSellPriceBuffer(new BigDecimal(price));
        item.setPrepTimeMinutes(prepTime);
        item.setTargetFoodCostPct(new BigDecimal("0.28"));
        item = menuItemRepository.save(item);

        Recipe batchSource = recipeRepository.findAll().stream()
                .filter(r -> r.getName().equals(sourceRecipeName))
                .findFirst()
                .orElse(null);

        if (batchSource != null) {
            Recipe plateRecipe = new Recipe();
            plateRecipe.setMenuItem(item);
            plateRecipe.setRestaurant(res);
            plateRecipe.setName(name + " Plate Recipe");
            plateRecipe.setRecipeType(RecipeType.PLATE);
            plateRecipe.setStation(batchSource.getStation());
            plateRecipe.setActive(true);
            
            int lineNo = 1;
            for (RecipeIngredientLine bline : batchSource.getIngredientLines()) {
                RecipeIngredientLine pline = new RecipeIngredientLine();
                pline.setRecipe(plateRecipe);
                pline.setIngredient(bline.getIngredient());
                // Single portion: BatchQty / Yield
                pline.setQuantityRu(bline.getQuantityRu().divide(batchSource.getYieldQuantity(), 4, java.math.RoundingMode.HALF_UP));
                pline.setRecipeUnit(bline.getRecipeUnit());
                pline.setLineNumber(lineNo++);
                plateRecipe.getIngredientLines().add(pline);
            }
            recipeRepository.save(plateRecipe);
        }
    }

    private void addIngredientLine(Recipe recipe, Ingredient ing, String qty, RecipeUnit ru, int lineNo) {
        if (ing == null) return;
        RecipeIngredientLine line = new RecipeIngredientLine();
        line.setRecipe(recipe);
        line.setIngredient(ing);
        line.setQuantityRu(new BigDecimal(qty));
        line.setRecipeUnit(ru);
        line.setLineNumber(lineNo);
        recipe.getIngredientLines().add(line);
    }

    private void addProcedureStep(Recipe recipe, int stepNo, String instr, boolean ccp) {
        RecipeProcedureStep step = new RecipeProcedureStep();
        step.setRecipe(recipe);
        step.setStepNumber(stepNo);
        step.setInstruction(instr);
        step.setCriticalControlPoint(ccp);
        recipe.getProcedureSteps().add(step);
    }

    private Ingredient create(Restaurant res, String code, String desc, InventoryCategory cat, PurchaseUnit pu, RecipeUnit ru, String price, String ruPerPu, String yield) {
        Ingredient ing = new Ingredient();
        ing.setRestaurant(res);
        ing.setItemCode(code);
        ing.setDescription(desc);
        ing.setInventoryType(InventoryType.FOOD);
        ing.setCategory(cat);
        ing.setPurchaseUnit(pu);
        ing.setPurchaseUnitPrice(new BigDecimal(price));
        ing.setRecipeUnit(ru);
        ing.setRuPerPu(new BigDecimal(ruPerPu));
        ing.setYieldPct(new BigDecimal(yield));
        ing.setInventoryUnit(InventoryUnit.valueOf(pu.name()));
        ing.setIuPerPu(BigDecimal.ONE);
        ing.setOnHand(new BigDecimal("100.00"));
        ing.setParLevel(new BigDecimal("20.00"));
        return ing;
    }
}
