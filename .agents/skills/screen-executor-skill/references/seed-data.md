# Seed Data — Complete Java Seeders

All seeders are `@Profile("dev")` and idempotent (check `count() > 0` before inserting).
Execute in the order below to satisfy FK constraints.

---

## Master DataSeeder (orchestrator)

```java
package com.restaurant.seeder;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Run all seeders in order. Each seeder is @Order annotated.
 * Activated only in "dev" profile: spring.profiles.active=dev
 */
@Component
@Profile("dev")
@Order(0)
public class DataSeeder implements CommandLineRunner {
    // Spring auto-runs all CommandLineRunner beans in @Order sequence.
    // This class is a documentation marker only.
    @Override
    public void run(String... args) {
        System.out.println("[DataSeeder] Seeding dev data...");
    }
}
```

---

## 1. RestaurantSeeder.java

```java
@Component @Profile("dev") @Order(1)
public class RestaurantSeeder implements CommandLineRunner {

    @Autowired RestaurantRepository repo;

    @Override
    public void run(String... args) {
        if (repo.count() > 0) return;
        Restaurant r = new Restaurant();
        r.setName("Bistro Verde");
        r.setTimezone("America/New_York");
        r.setCreatedAt(LocalDateTime.now());
        repo.save(r);
        System.out.println("[Seed] Restaurant 'Bistro Verde' created with id=" + r.getId());
    }
}
```

---

## 2. SupplierSeeder.java

```java
@Component @Profile("dev") @Order(2)
public class SupplierSeeder implements CommandLineRunner {

    @Autowired SupplierRepository repo;
    @Autowired RestaurantRepository restaurantRepo;

    @Override
    public void run(String... args) {
        if (repo.count() > 0) return;
        Restaurant r = restaurantRepo.findAll().get(0);

        String[][] data = {
            {"Fresh Fields Produce",   "Maria Lopez",   "555-0101", "supplier@freshfields.com",  "FF-2024"},
            {"Premier Meats & Poultry","Tom Butcher",   "555-0202", "orders@premiermeats.com",   "PM-9001"},
            {"Ocean Blue Seafood",     "Anna Chen",     "555-0303", "anna@oceanblue.com",         "OB-3312"},
            {"Valley Dairy Co.",       "Rick Frost",    "555-0404", "rick@valleydairy.com",       "VD-0055"},
            {"Metro Wine & Spirits",   "Carla Vinos",   "555-0505", "orders@metrowine.com",       "MW-7788"},
        };

        for (String[] d : data) {
            Supplier s = new Supplier();
            s.setRestaurant(r);
            s.setName(d[0]); s.setContactName(d[1]);
            s.setPhone(d[2]); s.setEmail(d[3]);
            s.setAccountNumber(d[4]); s.setActive(true);
            s.setCreatedAt(LocalDateTime.now());
            repo.save(s);
        }
        System.out.println("[Seed] 5 suppliers created");
    }
}
```

---

## 3. MenuCostGroupSeeder.java

```java
@Component @Profile("dev") @Order(3)
public class MenuCostGroupSeeder implements CommandLineRunner {

    @Autowired MenuCostGroupRepository repo;
    @Autowired RestaurantRepository restaurantRepo;

    @Override
    public void run(String... args) {
        if (repo.count() > 0) return;
        Restaurant r = restaurantRepo.findAll().get(0);

        String[][] groups = {
            {"Food", "0.30"},          // 30% target FC
            {"Beverages", "0.25"},
            {"Desserts", "0.28"},
            {"Cocktails", "0.20"},
        };
        int order = 1;
        for (String[] g : groups) {
            MenuCostGroup mcg = new MenuCostGroup();
            mcg.setRestaurant(r);
            mcg.setName(g[0]);
            mcg.setDisplayOrder(order++);
            mcg.setTargetFoodCostPct(new BigDecimal(g[1]));
            mcg.setActive(true);
            repo.save(mcg);
        }
        System.out.println("[Seed] 4 cost groups created");
    }
}
```

---

## 4. DiningTableSeeder.java

```java
@Component @Profile("dev") @Order(4)
public class DiningTableSeeder implements CommandLineRunner {

    @Autowired DiningTableRepository repo;
    @Autowired RestaurantRepository restaurantRepo;

    @Override
    public void run(String... args) {
        if (repo.count() > 0) return;
        Restaurant r = restaurantRepo.findAll().get(0);

        // Section A — 8 tables (2-tops and 4-tops)
        int[] capacities = {2, 2, 4, 4, 4, 4, 6, 6};
        for (int i = 0; i < capacities.length; i++) {
            DiningTable t = new DiningTable();
            t.setRestaurant(r);
            t.setTableNumber(String.valueOf(i + 1));
            t.setSection("Main");
            t.setCapacity(capacities[i]);
            t.setActive(true);
            repo.save(t);
        }
        // Section B — 4 tables (bar seating)
        for (int i = 0; i < 4; i++) {
            DiningTable t = new DiningTable();
            t.setRestaurant(r);
            t.setTableNumber("B" + (i + 1));
            t.setSection("Bar");
            t.setCapacity(2);
            t.setActive(i < 3);   // B4 inactive
            repo.save(t);
        }
        System.out.println("[Seed] 12 dining tables created");
    }
}
```

---

## 5. IngredientSeeder.java

```java
@Component @Profile("dev") @Order(5)
public class IngredientSeeder implements CommandLineRunner {

    @Autowired IngredientRepository repo;
    @Autowired RestaurantRepository restaurantRepo;

    @Override
    public void run(String... args) {
        if (repo.count() > 0) return;
        Restaurant r = restaurantRepo.findAll().get(0);

        // Format: code, description, type, category, PU, packSize, PUPrice,
        //         RU, ruPerPu, yieldPct, IU, iuPerPu, parLevel
        Object[][] food = {
          // Produce
          {"F-V-001","Fresh Tomatoes","FOOD","PRODUCE","LB","25 lb case",2.50,"OZ_WEIGHT",16.0,0.90,"LB",1.0,10.0},
          {"F-V-002","Baby Spinach","FOOD","PRODUCE","CASE","4/2.5 lb bag",18.00,"OZ_WEIGHT",160.0,0.95,"LB",10.0,5.0},
          {"F-V-003","Yellow Onions","FOOD","PRODUCE","LB","50 lb bag",0.75,"OZ_WEIGHT",16.0,0.85,"LB",1.0,15.0},
          {"F-V-004","Garlic Cloves","FOOD","PRODUCE","LB","5 lb bag",3.20,"OZ_WEIGHT",16.0,0.80,"LB",1.0,3.0},
          {"F-V-005","Russet Potatoes","FOOD","PRODUCE","LB","50 lb bag",0.55,"LB",1.0,0.90,"LB",1.0,20.0},
          // Meat
          {"F-M-001","Chicken Breast","FOOD","MEAT","LB","40 lb case",4.80,"OZ_WEIGHT",16.0,0.90,"LB",1.0,20.0},
          {"F-M-002","Beef Tenderloin","FOOD","MEAT","LB","15 lb avg",22.50,"OZ_WEIGHT",16.0,0.75,"LB",1.0,8.0},
          {"F-M-003","Pork Loin","FOOD","MEAT","LB","10 lb avg",5.50,"OZ_WEIGHT",16.0,0.85,"LB",1.0,10.0},
          // Seafood
          {"F-S-001","Atlantic Salmon","FOOD","SEAFOOD","LB","12 lb fillet",12.00,"OZ_WEIGHT",16.0,0.80,"LB",1.0,6.0},
          {"F-S-002","Shrimp 16/20","FOOD","SEAFOOD","LB","5 lb bag",14.50,"OZ_WEIGHT",16.0,0.95,"LB",1.0,5.0},
          // Dairy
          {"F-D-001","Heavy Cream","FOOD","DAIRY","GALLON","4/1 gal case",7.50,"CUP",16.0,1.0,"GALLON",1.0,2.0},
          {"F-D-002","Parmesan Cheese","FOOD","DAIRY","LB","5 lb block",8.00,"OZ_WEIGHT",16.0,1.0,"LB",1.0,3.0},
          {"F-D-003","Unsalted Butter","FOOD","DAIRY","LB","36 lb case",4.20,"OZ_WEIGHT",16.0,1.0,"LB",1.0,5.0},
          // Dry Goods
          {"F-G-001","Pasta — Penne","FOOD","DRY_GOODS","LB","20 lb case",1.80,"OZ_WEIGHT",16.0,1.0,"LB",1.0,10.0},
          {"F-G-002","Olive Oil EVOO","FOOD","DRY_GOODS","LITER","12/1L case",12.00,"OZ_FLUID",33.8,1.0,"LITER",1.0,6.0},
          {"F-G-003","Bread Flour","FOOD","DRY_GOODS","LB","50 lb bag",0.90,"OZ_WEIGHT",16.0,1.0,"LB",1.0,25.0},
          {"F-G-004","Kosher Salt","FOOD","DRY_GOODS","LB","3 lb box",1.20,"OZ_WEIGHT",16.0,1.0,"LB",1.0,5.0},
          // Eggs
          {"F-G-005","Large Eggs","FOOD","DRY_GOODS","CASE","30 dozen",42.00,"EACH",360.0,1.0,"EACH",1.0,30.0},
          // Sauces
          {"F-G-006","San Marzano Tomatoes","FOOD","DRY_GOODS","CASE","6/#10 cans",28.00,"OZ_WEIGHT",420.0,1.0,"CASE",1.0,2.0},
          {"F-G-007","Chicken Stock","FOOD","DRY_GOODS","CASE","12/32oz cartons",36.00,"OZ_FLUID",384.0,1.0,"CASE",1.0,3.0},
        };

        // Bar ingredients
        Object[][] bar = {
          {"B-L-001","Vodka — Well","BAR","LIQUOR","BOTTLE","1.75L handle",18.00,"OZ_FLUID",59.2,1.0,"BOTTLE",1.0,3.0},
          {"B-L-002","Gin — London Dry","BAR","LIQUOR","BOTTLE","750ml",22.00,"OZ_FLUID",25.4,1.0,"BOTTLE",1.0,2.0},
          {"B-L-003","Bourbon — House","BAR","LIQUOR","BOTTLE","1L",28.00,"OZ_FLUID",33.8,1.0,"BOTTLE",1.0,3.0},
          {"B-L-004","Rum — White","BAR","LIQUOR","BOTTLE","750ml",15.00,"OZ_FLUID",25.4,1.0,"BOTTLE",1.0,2.0},
          {"B-L-005","Tequila — Blanco","BAR","LIQUOR","BOTTLE","750ml",32.00,"OZ_FLUID",25.4,1.0,"BOTTLE",1.0,2.0},
          {"B-W-001","House Red Wine","BAR","WINE","BOTTLE","750ml",14.00,"OZ_FLUID",25.4,1.0,"BOTTLE",1.0,12.0},
          {"B-W-002","House White Wine","BAR","WINE","BOTTLE","750ml",13.00,"OZ_FLUID",25.4,1.0,"BOTTLE",1.0,12.0},
          {"B-B-001","Draft IPA Keg","BAR","BEER","KEG","1/2 bbl",180.00,"OZ_FLUID",1984.0,1.0,"KEG",1.0,1.0},
          {"B-B-002","Lager Keg","BAR","BEER","KEG","1/4 bbl",95.00,"OZ_FLUID",992.0,1.0,"KEG",1.0,1.0},
          {"B-M-001","Simple Syrup","BAR","BEVERAGES","LITER","1L bottle",4.00,"OZ_FLUID",33.8,1.0,"LITER",1.0,2.0},
        };

        int seq = 1;
        for (Object[] d : food) { saveIngredient(r, d, seq++); }
        for (Object[] d : bar)  { saveIngredient(r, d, seq++); }
        System.out.println("[Seed] 30 ingredients created (20 FOOD + 10 BAR)");
    }

    private void saveIngredient(Restaurant r, Object[] d, int seq) {
        Ingredient i = new Ingredient();
        i.setRestaurant(r);
        i.setItemCode((String) d[0]);
        i.setDescription((String) d[1]);
        i.setInventoryType(InventoryType.valueOf((String) d[2]));
        i.setCategory(InventoryCategory.valueOf((String) d[3]));
        i.setPurchaseUnit(PurchaseUnit.valueOf((String) d[4]));
        i.setCasePackSize((String) d[5]);
        i.setPurchaseUnitPrice(new BigDecimal(d[6].toString()));
        i.setRecipeUnit(RecipeUnit.valueOf((String) d[7]));
        i.setRuPerPu(new BigDecimal(d[8].toString()));
        i.setYieldPct(new BigDecimal(d[9].toString()));
        i.setInventoryUnit(InventoryUnit.valueOf((String) d[10]));
        i.setIuPerPu(new BigDecimal(d[11].toString()));
        i.setParLevel(new BigDecimal(d[12].toString()));
        i.setActive(true);
        i.setCreatedAt(LocalDateTime.now());
        repo.save(i);
    }
}
```

---

## 6. BatchRecipeSeeder.java

```java
@Component @Profile("dev") @Order(6)
public class BatchRecipeSeeder implements CommandLineRunner {

    @Autowired BatchRecipeRepository recipeRepo;
    @Autowired BatchRecipeLineRepository lineRepo;
    @Autowired IngredientRepository ingredientRepo;
    @Autowired RestaurantRepository restaurantRepo;

    @Override
    public void run(String... args) {
        if (recipeRepo.count() > 0) return;
        Restaurant r = restaurantRepo.findAll().get(0);
        Map<String, Ingredient> ing = ingredientRepo.findByRestaurant(r)
            .stream().collect(Collectors.toMap(Ingredient::getItemCode, x -> x));

        // Recipe 1: Marinara Sauce (yields 32 oz)
        BatchRecipe marinara = recipe(r, "Marinara Sauce", 32, "OZ_FLUID");
        recipeRepo.save(marinara);
        saveLine(marinara, ing.get("F-G-006"), 28.0, "OZ_WEIGHT");  // San Marzano
        saveLine(marinara, ing.get("F-V-001"), 8.0,  "OZ_WEIGHT");  // Tomatoes
        saveLine(marinara, ing.get("F-V-003"), 4.0,  "OZ_WEIGHT");  // Onions
        saveLine(marinara, ing.get("F-V-004"), 1.0,  "OZ_WEIGHT");  // Garlic
        saveLine(marinara, ing.get("F-G-002"), 2.0,  "OZ_FLUID");   // Olive oil

        // Recipe 2: Chicken Piccata Base (yields 8 portions)
        BatchRecipe piccata = recipe(r, "Chicken Piccata Base", 8, "EACH");
        recipeRepo.save(piccata);
        saveLine(piccata, ing.get("F-M-001"), 48.0, "OZ_WEIGHT");
        saveLine(piccata, ing.get("F-G-001"), 8.0,  "OZ_WEIGHT");
        saveLine(piccata, ing.get("F-D-003"), 4.0,  "OZ_WEIGHT");
        saveLine(piccata, ing.get("F-G-002"), 3.0,  "OZ_FLUID");

        // Recipe 3: Caesar Dressing (yields 24 oz)
        BatchRecipe caesar = recipe(r, "Caesar Dressing", 24, "OZ_FLUID");
        recipeRepo.save(caesar);
        saveLine(caesar, ing.get("F-G-005"), 4.0,  "EACH");
        saveLine(caesar, ing.get("F-D-002"), 4.0,  "OZ_WEIGHT");
        saveLine(caesar, ing.get("F-G-002"), 6.0,  "OZ_FLUID");
        saveLine(caesar, ing.get("F-V-004"), 0.5,  "OZ_WEIGHT");

        // Recipe 4: Salmon Glaze (yields 16 oz)
        BatchRecipe salmonGlaze = recipe(r, "Salmon Glaze", 16, "OZ_FLUID");
        recipeRepo.save(salmonGlaze);
        saveLine(salmonGlaze, ing.get("F-S-001"), 32.0, "OZ_WEIGHT");
        saveLine(salmonGlaze, ing.get("F-D-003"), 2.0,  "OZ_WEIGHT");
        saveLine(salmonGlaze, ing.get("F-G-007"), 8.0,  "OZ_FLUID");

        // Recipe 5: Potato Gratin (yields 12 portions)
        BatchRecipe gratin = recipe(r, "Potato Gratin", 12, "EACH");
        recipeRepo.save(gratin);
        saveLine(gratin, ing.get("F-V-005"), 48.0, "OZ_WEIGHT");
        saveLine(gratin, ing.get("F-D-001"), 8.0,  "CUP");
        saveLine(gratin, ing.get("F-D-002"), 6.0,  "OZ_WEIGHT");
        saveLine(gratin, ing.get("F-D-003"), 3.0,  "OZ_WEIGHT");

        System.out.println("[Seed] 5 batch recipes created");
    }

    private BatchRecipe recipe(Restaurant r, String name, double qty, String unit) {
        BatchRecipe rec = new BatchRecipe();
        rec.setRestaurant(r);
        rec.setName(name);
        rec.setYieldQuantity(new BigDecimal(qty));
        rec.setYieldUnit(RecipeUnit.valueOf(unit));
        rec.setActive(true);
        rec.setCreatedAt(LocalDateTime.now());
        return rec;
    }

    private void saveLine(BatchRecipe rec, Ingredient ing, double qty, String unit) {
        BatchRecipeLine l = new BatchRecipeLine();
        l.setRecipe(rec);
        l.setIngredient(ing);
        l.setQuantity(new BigDecimal(qty));
        l.setRecipeUnit(RecipeUnit.valueOf(unit));
        lineRepo.save(l);
    }
}
```

---

## 7. MenuItemSeeder.java

```java
@Component @Profile("dev") @Order(7)
public class MenuItemSeeder implements CommandLineRunner {

    @Autowired MenuItemRepository menuItemRepo;
    @Autowired MenuCostGroupRepository costGroupRepo;
    @Autowired RestaurantRepository restaurantRepo;

    @Override
    public void run(String... args) {
        if (menuItemRepo.count() > 0) return;
        Restaurant r = restaurantRepo.findAll().get(0);
        Map<String, MenuCostGroup> groups = costGroupRepo.findByRestaurant(r)
            .stream().collect(Collectors.toMap(MenuCostGroup::getName, x -> x));

        // Food items
        Object[][] food = {
            {"Margherita Pizza",     "FOOD", "101", 18.00},
            {"Chicken Piccata",      "FOOD", "102", 24.00},
            {"Salmon Fillet",        "FOOD", "103", 29.00},
            {"Caesar Salad",         "FOOD", "104", 14.00},
            {"Beef Tenderloin",      "FOOD", "105", 42.00},
            {"Pasta Pomodoro",       "FOOD", "106", 16.00},
            {"Shrimp Scampi",        "FOOD", "107", 26.00},
            // Desserts
            {"Tiramisu",             "Desserts", "201", 9.00},
            {"Crème Brûlée",         "Desserts", "202", 10.00},
            {"Chocolate Lava Cake",  "Desserts", "203", 11.00},
            // Beverages
            {"Sparkling Water",      "Beverages", "301", 4.00},
            {"Fresh Lemonade",       "Beverages", "302", 5.00},
            // Cocktails
            {"Classic Negroni",      "Cocktails", "401", 14.00},
            {"Aperol Spritz",        "Cocktails", "402", 13.00},
            {"Old Fashioned",        "Cocktails", "403", 15.00},
        };

        for (Object[] d : food) {
            MenuItem mi = new MenuItem();
            mi.setRestaurant(r);
            String groupName = d[1].equals("FOOD") ? "Food" : (String) d[1];
            mi.setCostGroup(groups.get(groupName));
            mi.setName((String) d[0]);
            mi.setPlu((String) d[2]);
            mi.setSellPrice(new BigDecimal(d[3].toString()));
            mi.setActive(true);
            mi.setCreatedAt(LocalDateTime.now());
            menuItemRepo.save(mi);
        }
        System.out.println("[Seed] 15 menu items created");
    }
}
```

---

## 8. PurchaseInvoiceSeeder.java

```java
@Component @Profile("dev") @Order(8)
public class PurchaseInvoiceSeeder implements CommandLineRunner {

    @Autowired PurchaseInvoiceRepository invoiceRepo;
    @Autowired InvoiceLineRepository lineRepo;
    @Autowired SupplierRepository supplierRepo;
    @Autowired IngredientRepository ingredientRepo;
    @Autowired RestaurantRepository restaurantRepo;

    @Override
    public void run(String... args) {
        if (invoiceRepo.count() > 0) return;
        Restaurant r = restaurantRepo.findAll().get(0);
        List<Supplier> suppliers = supplierRepo.findByRestaurant(r);
        List<Ingredient> ingredients = ingredientRepo.findByRestaurant(r);

        // Posted invoices (last 4 weeks)
        for (int week = 0; week < 4; week++) {
            LocalDate invoiceDate = LocalDate.now().minusWeeks(week).with(DayOfWeek.MONDAY);
            PurchaseInvoice inv = new PurchaseInvoice();
            inv.setRestaurant(r);
            inv.setSupplier(suppliers.get(week % suppliers.size()));
            inv.setInvoiceDate(invoiceDate);
            inv.setInvoiceNumber("INV-2024-" + String.format("%04d", week + 1));
            inv.setStatus(InvoiceStatus.POSTED);
            inv.setPostedAt(invoiceDate.plusDays(1).atStartOfDay());
            inv.setCreatedAt(LocalDateTime.now());
            invoiceRepo.save(inv);

            // Add 3-5 lines per invoice
            BigDecimal total = BigDecimal.ZERO;
            for (int li = 0; li < 4; li++) {
                Ingredient ing = ingredients.get((week * 4 + li) % ingredients.size());
                InvoiceLine line = new InvoiceLine();
                line.setInvoice(inv);
                line.setIngredient(ing);
                line.setQuantity(new BigDecimal(2 + li));
                line.setPurchaseUnit(ing.getPurchaseUnit());
                line.setUnitPrice(ing.getPurchaseUnitPrice());
                line.setExtension(line.getQuantity().multiply(line.getUnitPrice()));
                total = total.add(line.getExtension());
                lineRepo.save(line);
            }
            inv.setTotalAmount(total);
            invoiceRepo.save(inv);
        }

        // 2 DRAFT invoices (current week)
        for (int i = 0; i < 2; i++) {
            PurchaseInvoice draft = new PurchaseInvoice();
            draft.setRestaurant(r);
            draft.setSupplier(suppliers.get(i));
            draft.setInvoiceDate(LocalDate.now());
            draft.setStatus(InvoiceStatus.DRAFT);
            draft.setTotalAmount(BigDecimal.ZERO);
            draft.setCreatedAt(LocalDateTime.now());
            invoiceRepo.save(draft);
        }

        System.out.println("[Seed] 6 purchase invoices created (4 POSTED + 2 DRAFT)");
    }
}
```

---

## 9. InventoryPeriodSeeder.java

```java
@Component @Profile("dev") @Order(9)
public class InventoryPeriodSeeder implements CommandLineRunner {

    @Autowired InventoryPeriodRepository periodRepo;
    @Autowired InventoryLineItemRepository lineRepo;
    @Autowired IngredientRepository ingredientRepo;
    @Autowired RestaurantRepository restaurantRepo;

    @Override
    public void run(String... args) {
        if (periodRepo.count() > 0) return;
        Restaurant r = restaurantRepo.findAll().get(0);

        List<Ingredient> food = ingredientRepo.findByRestaurantAndInventoryType(r, InventoryType.FOOD);
        List<Ingredient> bar  = ingredientRepo.findByRestaurantAndInventoryType(r, InventoryType.BAR);

        // FOOD — last month, FINALISED
        InventoryPeriod fp = createPeriod(r, LocalDate.now().minusMonths(1), InventoryType.FOOD, PeriodStatus.FINALISED);
        periodRepo.save(fp);
        addLines(fp, food, 0.7, 1.0);  // counts at 70-100% of par

        // BAR — current month, OPEN
        InventoryPeriod bp = createPeriod(r, LocalDate.now(), InventoryType.BAR, PeriodStatus.OPEN);
        periodRepo.save(bp);
        addLines(bp, bar, 0.0, 0.0);   // all zeros (not yet counted)

        System.out.println("[Seed] 2 inventory periods (1 FINALISED FOOD + 1 OPEN BAR)");
    }

    private InventoryPeriod createPeriod(Restaurant r, LocalDate date,
                                          InventoryType type, PeriodStatus status) {
        InventoryPeriod p = new InventoryPeriod();
        p.setRestaurant(r); p.setPeriodDate(date);
        p.setInventoryType(type); p.setStatus(status);
        if (status == PeriodStatus.FINALISED)
            p.setFinalisedAt(date.plusDays(1).atStartOfDay());
        p.setCreatedAt(LocalDateTime.now());
        return p;
    }

    private void addLines(InventoryPeriod p, List<Ingredient> ings,
                          double minRatio, double maxRatio) {
        Random rnd = new Random(42);
        for (Ingredient ing : ings) {
            InventoryLineItem li = new InventoryLineItem();
            li.setPeriod(p); li.setIngredient(ing);
            double parLevel = ing.getParLevel() != null ? ing.getParLevel().doubleValue() : 5.0;
            double ratio = minRatio + rnd.nextDouble() * (maxRatio - minRatio);
            li.setCount(new BigDecimal(parLevel * ratio).setScale(2, RoundingMode.HALF_UP));
            lineRepo.save(li);
        }
    }
}
```

---

## 10. PosSeeder.java (TableSessions + Orders)

```java
@Component @Profile("dev") @Order(10)
public class PosSeeder implements CommandLineRunner {

    @Autowired DiningTableRepository tableRepo;
    @Autowired TableSessionRepository sessionRepo;
    @Autowired OrderRepository orderRepo;
    @Autowired OrderLineRepository lineRepo;
    @Autowired MenuItemRepository menuItemRepo;
    @Autowired RestaurantRepository restaurantRepo;

    @Override
    public void run(String... args) {
        if (sessionRepo.count() > 0) return;
        Restaurant r = restaurantRepo.findAll().get(0);
        List<DiningTable> tables = tableRepo.findByRestaurantAndActive(r, true);
        List<MenuItem> items = menuItemRepo.findByRestaurantAndActive(r, true);

        // Closed sessions — last 7 days
        LocalDateTime base = LocalDateTime.now().minusDays(7).withHour(18).withMinute(0);
        for (int day = 0; day < 7; day++) {
            for (int s = 0; s < 4; s++) {
                DiningTable table = tables.get(s % tables.size());
                LocalDateTime openedAt = base.plusDays(day).plusMinutes(s * 45L);
                LocalDateTime closedAt = openedAt.plusMinutes(60 + (s * 15));
                TableSession session = new TableSession();
                session.setRestaurant(r); session.setTable(table);
                session.setGuestCount(2 + (s % 3));
                session.setOpenedAt(openedAt); session.setClosedAt(closedAt);
                session.setStatus(SessionStatus.CLOSED);
                sessionRepo.save(session);

                Order order = new Order();
                order.setSession(session); order.setStatus(OrderStatus.CLOSED);
                order.setOrderedAt(openedAt.plusMinutes(5));
                order.setFiredAt(openedAt.plusMinutes(7));
                order.setClosedAt(closedAt.minusMinutes(10));
                orderRepo.save(order);

                // 2-4 items per order
                BigDecimal orderTotal = BigDecimal.ZERO;
                for (int li = 0; li < 2 + (s % 3); li++) {
                    MenuItem item = items.get((day * 4 + s + li) % items.size());
                    OrderLine ol = new OrderLine();
                    ol.setOrder(order); ol.setMenuItem(item);
                    ol.setQuantity(1 + (li % 2));
                    ol.setPriceAtOrder(item.getSellPrice());
                    ol.setStatus(OrderLineStatus.ORDERED);
                    ol.setCreatedAt(openedAt.plusMinutes(5));
                    lineRepo.save(ol);
                    orderTotal = orderTotal.add(
                        item.getSellPrice().multiply(new BigDecimal(ol.getQuantity()))
                    );
                }
                order.setOrderTotal(orderTotal);
                orderRepo.save(order);
                session.setSessionTotal(orderTotal);
                sessionRepo.save(session);
            }
        }

        // Live open sessions — 3 tables currently occupied
        for (int t = 0; t < 3; t++) {
            DiningTable table = tables.get(t);
            LocalDateTime openedAt = LocalDateTime.now().minusMinutes(30 + (t * 20L));
            TableSession session = new TableSession();
            session.setRestaurant(r); session.setTable(table);
            session.setGuestCount(2 + t);
            session.setOpenedAt(openedAt);
            session.setStatus(SessionStatus.OPEN);
            session.setSessionTotal(BigDecimal.ZERO);
            sessionRepo.save(session);

            Order order = new Order();
            order.setSession(session); order.setStatus(OrderStatus.OPEN);
            order.setOrderedAt(openedAt.plusMinutes(3));
            orderRepo.save(order);

            MenuItem item = items.get(t % items.size());
            OrderLine ol = new OrderLine();
            ol.setOrder(order); ol.setMenuItem(item);
            ol.setQuantity(1); ol.setPriceAtOrder(item.getSellPrice());
            ol.setStatus(OrderLineStatus.ORDERED);
            ol.setCreatedAt(openedAt.plusMinutes(3));
            lineRepo.save(ol);
            order.setOrderTotal(item.getSellPrice());
            orderRepo.save(order);
            session.setSessionTotal(item.getSellPrice());
            sessionRepo.save(session);
        }

        System.out.println("[Seed] Table sessions + orders created (28 closed + 3 open)");
    }
}
```

---

## 11. MenuEngineeringSeeder.java

```java
@Component @Profile("dev") @Order(11)
public class MenuEngineeringSeeder implements CommandLineRunner {

    @Autowired MenuEngineeringPeriodRepository periodRepo;
    @Autowired MenuEngineeringResultRepository resultRepo;
    @Autowired MenuItemRepository menuItemRepo;
    @Autowired OrderLineRepository orderLineRepo;
    @Autowired RestaurantRepository restaurantRepo;

    @Override
    public void run(String... args) {
        if (periodRepo.count() > 0) return;
        Restaurant r = restaurantRepo.findAll().get(0);

        MenuEngineeringPeriod period = new MenuEngineeringPeriod();
        period.setRestaurant(r);
        period.setPeriodBeginDate(LocalDate.now().minusDays(7));
        period.setPeriodEndDate(LocalDate.now().minusDays(1));
        period.setPopularityFactor(new BigDecimal("0.80"));
        period.setStatus(AnalysisStatus.FINALISED);
        period.setCreatedAt(LocalDateTime.now());
        periodRepo.save(period);

        // Results seeded from real OrderLine data (service would compute this)
        List<MenuItem> items = menuItemRepo.findByRestaurantAndActive(r, true);
        int[] qtySold = {24, 18, 12, 31, 8, 22, 15, 11, 9, 7, 42, 19, 16, 21, 13};

        for (int i = 0; i < Math.min(items.size(), qtySold.length); i++) {
            MenuItem mi = items.get(i);
            MenuEngineeringResult result = new MenuEngineeringResult();
            result.setPeriod(period);
            result.setMenuItem(mi);
            result.setItemNameSnapshot(mi.getName());
            result.setQuantitySold(qtySold[i]);
            result.setSellPrice(mi.getSellPrice());
            // Approximate item cost at 28% food cost
            result.setItemCost(mi.getSellPrice().multiply(new BigDecimal("0.28")));
            resultRepo.save(result);
        }

        System.out.println("[Seed] 1 menu engineering period (FINALISED) + " + Math.min(items.size(), qtySold.length) + " results");
    }
}
```

---

## 12. GuestCountSeeder.java

```java
@Component @Profile("dev") @Order(12)
public class GuestCountSeeder implements CommandLineRunner {

    @Autowired GuestCountEntryRepository repo;
    @Autowired RestaurantRepository restaurantRepo;

    @Override
    public void run(String... args) {
        if (repo.count() > 0) return;
        Restaurant r = restaurantRepo.findAll().get(0);
        LocalDate weekStart = LocalDate.now().with(DayOfWeek.MONDAY);

        // Lunch and dinner slots (30-min intervals 11:30 – 22:00)
        LocalTime[] slots = {
            LocalTime.of(11, 30), LocalTime.of(12, 0), LocalTime.of(12, 30),
            LocalTime.of(13, 0),  LocalTime.of(13, 30), LocalTime.of(18, 0),
            LocalTime.of(18, 30), LocalTime.of(19, 0),  LocalTime.of(19, 30),
            LocalTime.of(20, 0),  LocalTime.of(20, 30), LocalTime.of(21, 0),
        };

        int[][] counts = {
            // Mon  Tue  Wed  Thu  Fri  Sat  Sun
            {  8,   6,   7,   9,  14,  18,  16 },  // 11:30
            { 16,  14,  15,  18,  24,  32,  28 },  // 12:00
            { 22,  20,  21,  25,  35,  44,  40 },  // 12:30
            { 18,  16,  17,  20,  28,  38,  34 },  // 13:00
            { 12,  10,  11,  14,  20,  26,  22 },  // 13:30
            {  4,   6,   8,  10,  18,  24,  20 },  // 18:00
            { 14,  16,  18,  22,  36,  48,  42 },  // 18:30
            { 28,  30,  32,  38,  52,  64,  58 },  // 19:00
            { 36,  38,  40,  46,  60,  72,  66 },  // 19:30
            { 32,  34,  36,  40,  54,  66,  60 },  // 20:00
            { 24,  26,  28,  32,  44,  54,  48 },  // 20:30
            { 14,  16,  18,  22,  30,  38,  34 },  // 21:00
        };

        for (int s = 0; s < slots.length; s++) {
            GuestCountEntry e = new GuestCountEntry();
            e.setRestaurant(r);
            e.setWeekStartDate(weekStart);
            e.setTimeSlot(slots[s]);
            e.setCountMon(counts[s][0]); e.setCountTue(counts[s][1]);
            e.setCountWed(counts[s][2]); e.setCountThu(counts[s][3]);
            e.setCountFri(counts[s][4]); e.setCountSat(counts[s][5]);
            e.setCountSun(counts[s][6]);
            repo.save(e);
        }
        System.out.println("[Seed] 12 guest count slots for current week");
    }
}
```
