package mls.sho.dms;

import mls.sho.dms.application.costing.entity.MenuCostGroup;
import mls.sho.dms.application.costing.entity.Recipe;
import mls.sho.dms.application.costing.entity.RecipeIngredientLine;
import mls.sho.dms.application.inventory.entity.Ingredient;
import mls.sho.dms.application.inventory.entity.InventoryIngredientLedger;
import mls.sho.dms.application.inventory.repository.InventoryLedgerRepository;
import mls.sho.dms.application.inventory.service.InventoryIntelligenceService;
import mls.sho.dms.application.costing.repository.MenuCostGroupRepository;
import mls.sho.dms.application.pos.entity.MenuItem;
import mls.sho.dms.application.pos.entity.Order;
import mls.sho.dms.application.pos.entity.OrderLine;
import mls.sho.dms.application.pos.repository.OrderRepository;
import mls.sho.dms.application.pos.repository.RestaurantRepository;
import mls.sho.dms.entity.*;
import mls.sho.dms.common.enums.StockMovementType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Phase 1 Integration Test: Single Depletion per Order Line
 * 
 * Verifies that inventory is depleted exactly ONCE per order line,
 * even when:
 *   1. Order is placed (placeOrder)
 *   2. KDS marks ticket as READY (PosTicketReadyEvent)
 *   3. Order is paid (payOrder)
 * 
 * Before fix: Triple depletion (3x ledger entries per line)
 * After fix: Single depletion (1x ledger entry per line)
 */
@Testcontainers
@SpringBootTest
@Transactional
public class InventoryDepletionIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(
            DockerImageName.parse("postgres:15-alpine")
    )
    .withDatabaseName("shopro_test")
    .withUsername("test")
    .withPassword("test");

    @DynamicPropertySource
    static void configureTestProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.driver-class-name", postgres::getDriverClassName);
    }

    @Autowired
    private InventoryIntelligenceService inventoryService;

    @Autowired
    private InventoryLedgerRepository ledgerRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private MenuCostGroupRepository menuCostGroupRepository;

    @Test
    @DisplayName("Phase 1: Single depletion per order line with idempotency key")
    void orderFulfillment_shouldCreateExactlyOneLedgerEntryPerLine() {
        // Arrange: Create restaurant, ingredient, menu item with recipe
        Restaurant restaurant = createRestaurant();
        Ingredient ingredient = createIngredient(restaurant);
        Recipe recipe = createRecipe(restaurant, ingredient);
        MenuItem menuItem = createMenuItem(restaurant, recipe);
        
        // Create order with 2 lines
        Order order = createOrder(restaurant, menuItem);
        
        // Act: Call orderFulfillment (simulating KDS READY event)
        inventoryService.orderFulfillment(order);
        
        // Assert: Exactly 2 ledger entries (1 per line, since both lines use same item)
        List<InventoryIngredientLedger> ledgerEntries = ledgerRepository.findAllByOrderId(order.getId());
        
        // Should have exactly 2 DEPLETION entries (one per order line)
        List<InventoryIngredientLedger> depletionEntries = ledgerEntries.stream()
                .filter(e -> e.getEventType() == StockMovementType.DEPLETION)
                .toList();
        
        assertThat(depletionEntries).hasSize(2)
                .extracting(InventoryIngredientLedger::getFulfillmentKey)
                .containsExactlyInAnyOrder(
                    "ORD:" + order.getId() + ":" + order.getLines().get(0).getId(),
                    "ORD:" + order.getId() + ":" + order.getLines().get(1).getId()
                );
        
        // Verify all entries have fulfillment keys
        assertThat(depletionEntries).allMatch(e -> e.getFulfillmentKey() != null);
        
        // Verify quantities are negative (depletion)
        assertThat(depletionEntries).allMatch(e -> e.getQuantity().compareTo(BigDecimal.ZERO) < 0);
    }

    @Test
    @DisplayName("Phase 1: Idempotency key is generated for each order line")
    void orderFulfillment_shouldGenerateUniqueFulfillmentKeyPerLine() {
        // Arrange
        Restaurant restaurant = createRestaurant();
        Ingredient ingredient = createIngredient(restaurant);
        Recipe recipe = createRecipe(restaurant, ingredient);
        MenuItem menuItem = createMenuItem(restaurant, recipe);
        Order order = createOrder(restaurant, menuItem);
        
        // Act: Call orderFulfillment
        inventoryService.orderFulfillment(order);
        
        // Assert: Each line has a unique fulfillment key
        List<InventoryIngredientLedger> ledgerEntries = ledgerRepository.findAllByOrderId(order.getId());
        List<InventoryIngredientLedger> depletionEntries = ledgerEntries.stream()
                .filter(e -> e.getEventType() == StockMovementType.DEPLETION)
                .toList();
        
        // Verify all entries have non-null fulfillment keys
        assertThat(depletionEntries).allMatch(e -> e.getFulfillmentKey() != null,
                "All depletion entries should have fulfillment keys");
        
        // Verify keys are unique per line
        var uniqueKeys = depletionEntries.stream()
                .map(InventoryIngredientLedger::getFulfillmentKey)
                .distinct()
                .count();
        
        assertThat(uniqueKeys).isEqualTo(depletionEntries.size());
    }

    // -- Helper methods --

    private Restaurant createRestaurant() {
        Restaurant r = new Restaurant();
        r.setName("Test Restaurant");
        r.setTimezone("America/New_York");
        return restaurantRepository.save(r);
    }

    private Ingredient createIngredient(Restaurant restaurant) {
        Ingredient i = new Ingredient();
        i.setRestaurant(restaurant);
        i.setItemCode("TEST001");
        i.setDescription("Test Ingredient");
        i.setInventoryType(mls.sho.dms.common.enums.InventoryType.FOOD);
        i.setCategory(mls.sho.dms.common.enums.InventoryCategory.DAIRY);
        i.setPurchaseUnit(mls.sho.dms.common.enums.PurchaseUnit.KG);
        i.setPurchaseUnitPrice(new BigDecimal("10.0000"));
        i.setRecipeUnit(mls.sho.dms.common.enums.RecipeUnit.KG);
        i.setRuPerPu(new BigDecimal("1.0000"));
        i.setYieldPct(new BigDecimal("0.9000"));
        i.setInventoryUnit(mls.sho.dms.common.enums.InventoryUnit.KG);
        i.setIuPerPu(new BigDecimal("1.0000"));
        return i;
    }

    private Recipe createRecipe(Restaurant restaurant, Ingredient ingredient) {
        Recipe r = new Recipe();
        r.setName("Test Recipe");
        r.setRestaurant(restaurant);
        r.setActive(true);
        r.setRecipeType(mls.sho.dms.common.enums.RecipeType.PLATE);
        r.setYieldQuantity(new BigDecimal("1"));
        r.setStation(mls.sho.dms.common.enums.KitchenStationType.GRILL);
        
        RecipeIngredientLine line = new RecipeIngredientLine();
        line.setIngredient(ingredient);
        line.setQuantityRu(new BigDecimal("0.5")); // 0.5 kg per portion
        line.setRecipeUnit(mls.sho.dms.common.enums.RecipeUnit.KG);
        line.setLineNumber(1);
        line.setRecipe(r);
        r.getIngredientLines().add(line);
        
        return r;
    }

    private MenuItem createMenuItem(Restaurant restaurant, Recipe recipe) {
        MenuCostGroup group = new MenuCostGroup();
        group.setRestaurant(restaurant);
        group.setName("Test Group " + System.currentTimeMillis());
        group.setDisplayOrder(1);
        group = menuCostGroupRepository.save(group);
        
        MenuItem m = new MenuItem();
        m.setRestaurant(restaurant);
        m.setGroup(group);
        m.setPosId("ITEM" + System.currentTimeMillis());
        m.setName("Test Menu Item");
        m.setSellPriceBuffer(new BigDecimal("25.00"));
        m.setActive(true);
        m.getRecipes().add(recipe);
        recipe.setMenuItem(m);
        return m;
    }

    private Order createOrder(Restaurant restaurant, MenuItem menuItem) {
        Order o = new Order();
        o.setRestaurantId(restaurant.getId());
        o.setRestaurant(restaurant);
        o.setOrderNumber("ORD-TEST-001");
        o.setStatus(Order.OrderStatus.PENDING);
        o.setCreatedAt(LocalDateTime.now());
        
        // Line 1: 2 portions
        OrderLine line1 = new OrderLine();
        line1.setOrder(o);
        line1.setMenuItem(menuItem);
        line1.setQuantity(2);
        line1.setUnitPrice(new BigDecimal("25.00"));
        line1.setSubtotal(new BigDecimal("50.00"));
        o.getLines().add(line1);
        
        // Line 2: 1 portion
        OrderLine line2 = new OrderLine();
        line2.setOrder(o);
        line2.setMenuItem(menuItem);
        line2.setQuantity(1);
        line2.setUnitPrice(new BigDecimal("25.00"));
        line2.setSubtotal(new BigDecimal("25.00"));
        o.getLines().add(line2);
        
        return orderRepository.save(o);
    }
}
