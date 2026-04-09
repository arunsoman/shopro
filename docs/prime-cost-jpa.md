// ================================================================
// COMPLETE JPA ENTITIES — Restaurant Management Platform v4
// Subsystems: Inventory · Purchasing · Recipe/Costing ·
//             Menu Engineering · POS · Prime Cost · Labor
//
// Legend:
//  [K]  stored in PostgreSQL
//  [D]  derived at read time — never persisted
//  [R]  cached in Redis — has REST endpoint
//  [E]  enum field
// ================================================================

package com.restaurant.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;

// ════════════════════════════════════════════════════════════════
// ██  CROSS-CUTTING
// ════════════════════════════════════════════════════════════════

@Entity @Table(name = "restaurant")
public class Restaurant {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false)                               private String name;
    @Column(name = "timezone", nullable = false)            private String timezone;
    @Column(name = "created_at", updatable = false)         private LocalDateTime createdAt;
    @Column(name = "updated_at")                            private LocalDateTime updatedAt;
    // [R] restaurant:{id}:dashboard, restaurant:{id}:kpis:today, restaurant:{id}:kpis:week:{date}
}

@Entity @Table(name = "supplier",
    uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id","name"}))
public class Supplier {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)        private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="restaurant_id", nullable=false) private Restaurant restaurant;
    @Column(nullable=false)  private String name;
    @Column private String   contactName;
    @Column private String   phone;
    @Column private String   email;
    @Column(name="account_number") private String accountNumber;
    @Column(name="is_active", nullable=false) private boolean active = true;
    @Column(name="created_at", updatable=false) private LocalDateTime createdAt;
    @Column(name="updated_at") private LocalDateTime updatedAt;
}

// ════════════════════════════════════════════════════════════════
// ██  SUBSYSTEM 1 — INVENTORY
// ════════════════════════════════════════════════════════════════

@Entity @Table(name = "ingredient",
    uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id","item_code"}))
public class Ingredient {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="restaurant_id", nullable=false) private Restaurant restaurant;

    @Column(name="item_code", nullable=false, length=6)  private String itemCode;
    @Column(nullable=false)                              private String description;
    @Enumerated(EnumType.STRING) @Column(name="inventory_type", nullable=false) private InventoryType inventoryType;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private InventoryCategory category;

    // Purchase unit
    @Enumerated(EnumType.STRING) @Column(name="purchase_unit", nullable=false) private PurchaseUnit purchaseUnit;
    @Column(name="case_pack_size")                       private String casePackSize;
    @Column(name="purchase_unit_price", nullable=false, precision=10, scale=4) private BigDecimal purchaseUnitPrice;

    // Recipe unit
    @Enumerated(EnumType.STRING) @Column(name="recipe_unit", nullable=false) private RecipeUnit recipeUnit;
    @Column(name="ru_per_pu", nullable=false, precision=10, scale=4) private BigDecimal ruPerPu;
    @Column(name="yield_pct", nullable=false, precision=6, scale=4)  private BigDecimal yieldPct;
    // [D] ruCost = purchaseUnitPrice / ruPerPu / yieldPct → ConversionFunctions.calcRuCost()
    // [R] restaurant:{id}:ingredient:{id}:costs TTL 24hr

    // Inventory unit
    @Enumerated(EnumType.STRING) @Column(name="inventory_unit", nullable=false) private InventoryUnit inventoryUnit;
    @Column(name="iu_per_pu", nullable=false, precision=10, scale=4) private BigDecimal iuPerPu;
    // [D] iuCost = purchaseUnitPrice / iuPerPu → ConversionFunctions.calcIuCost()

    // Volume↔weight density
    @Column(name="oz_weight_per_cup", precision=8, scale=4) private BigDecimal ozWeightPerCup;
    @Enumerated(EnumType.STRING) @Column(name="packed_by")  private PackedBy packedBy;

    @Column(name="par_level", precision=10, scale=3) private BigDecimal parLevel;
    @Column(name="image_storage_key")                private String imageStorageKey;
    @Column(name="image_alt_text")                   private String imageAltText;
    @Column(name="image_version")                    private Integer imageVersion;
    @Column(name="is_active", nullable=false)        private boolean active = true;
    @Column(name="created_at", updatable=false)      private LocalDateTime createdAt;
    @Column(name="updated_at")                       private LocalDateTime updatedAt;
}

/** Track every price change over time — feeds Variance Attribution */
@Entity @Table(name = "ingredient_price_history")
public class IngredientPriceHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="ingredient_id", nullable=false) private Ingredient ingredient;
    @Column(name="old_price", nullable=false, precision=10, scale=4) private BigDecimal oldPrice;
    @Column(name="new_price", nullable=false, precision=10, scale=4) private BigDecimal newPrice;
    @Column(name="effective_date", nullable=false)                   private LocalDate  effectiveDate;
    @Column(name="changed_by_user_id")                               private Long       changedByUserId;
    @Column(name="created_at", updatable=false)                      private LocalDateTime createdAt;
}

@Entity @Table(name = "inventory_period",
    uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id","period_date","inventory_type"}))
public class InventoryPeriod {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="restaurant_id", nullable=false) private Restaurant restaurant;
    @Column(name="period_date", nullable=false)                   private LocalDate  periodDate;
    @Enumerated(EnumType.STRING) @Column(name="inventory_type", nullable=false) private InventoryType inventoryType;
    @Enumerated(EnumType.STRING) @Column(nullable=false)          private PeriodStatus status;
    @Column(name="finalised_at")                                  private LocalDateTime finalisedAt;
    @Column(name="created_at", updatable=false)                   private LocalDateTime createdAt;
    @OneToMany(mappedBy="inventoryPeriod", cascade=CascadeType.ALL, orphanRemoval=true)
    private List<InventoryLineItem> lineItems = new ArrayList<>();
    // [D] totalValue = SUM(count × iuCost) per line
    // [D] categoryBreakdown = GROUP BY ingredient.category
    // [R] restaurant:{id}:inventory:latest:{FOOD|BAR}
    public enum PeriodStatus { OPEN, FINALISED }
}

@Entity @Table(name = "inventory_line_item",
    uniqueConstraints = @UniqueConstraint(columnNames = {"inventory_period_id","ingredient_id"}))
public class InventoryLineItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="inventory_period_id", nullable=false) private InventoryPeriod inventoryPeriod;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="ingredient_id", nullable=false)       private Ingredient ingredient;
    @Column(nullable=false, precision=10, scale=3) private BigDecimal count;
    // [D] extension = count × calcIuCost(ingredient)
}

// ════════════════════════════════════════════════════════════════
// ██  SUBSYSTEM 2 — PURCHASING
// ════════════════════════════════════════════════════════════════

@Entity @Table(name = "purchase_invoice")
public class PurchaseInvoice {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="restaurant_id", nullable=false) private Restaurant restaurant;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="supplier_id", nullable=false)   private Supplier supplier;
    @Column(name="invoice_date", nullable=false)            private LocalDate    invoiceDate;
    @Column(name="invoice_number")                          private String       invoiceNumber;
    @Column(name="invoice_amount", nullable=false, precision=12, scale=2) private BigDecimal invoiceAmount;
    @Enumerated(EnumType.STRING) @Column(nullable=false)    private InvoiceStatus status;
    @Column(name="created_at", updatable=false)             private LocalDateTime createdAt;
    @Column(name="updated_at")                              private LocalDateTime updatedAt;
    @OneToMany(mappedBy="invoice", cascade=CascadeType.ALL, orphanRemoval=true)
    private List<PurchaseInvoiceLine> lines = new ArrayList<>();
    // [D] proof = invoiceAmount − SUM(lines.amount) → calcInvoiceProof()
    // [R] restaurant:{id}:purchases:week:{weekStart} TTL 1hr
    public enum InvoiceStatus { DRAFT, POSTED, VOID }
}

@Entity @Table(name = "purchase_invoice_line",
    uniqueConstraints = @UniqueConstraint(columnNames = {"invoice_id","purchase_category"}))
public class PurchaseInvoiceLine {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="invoice_id", nullable=false) private PurchaseInvoice invoice;
    @Enumerated(EnumType.STRING) @Column(name="purchase_category", nullable=false)  private PurchaseCategory purchaseCategory;
    @Column(nullable=false, precision=12, scale=2)                                   private BigDecimal amount;
    // [D] pct = amount / invoice.invoiceAmount
}

// ════════════════════════════════════════════════════════════════
// ██  SUBSYSTEM 3 — RECIPE & MENU COSTING
// ════════════════════════════════════════════════════════════════

@Entity @Table(name = "batch_recipe",
    uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id","name"}))
public class BatchRecipe {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="restaurant_id", nullable=false) private Restaurant restaurant;
    @Column(nullable=false)  private String name;
    @Enumerated(EnumType.STRING) @Column(name="station", nullable=false) private KitchenStationType station;
    @Enumerated(EnumType.STRING) @Column(name="shelf_life")              private ShelfLife shelfLife;
    @Column(name="tools_equipment", length=500) private String toolsEquipment;
    @Column(name="position_notes", length=500)  private String positionNotes;
    @Column(name="yield_quantity", nullable=false, precision=10, scale=3) private BigDecimal yieldQuantity;
    @Enumerated(EnumType.STRING) @Column(name="yield_unit", nullable=false) private RecipeUnit yieldUnit;
    @Column(name="is_active", nullable=false) private boolean active = true;
    @Column(name="created_at", updatable=false) private LocalDateTime createdAt;
    @Column(name="updated_at")                  private LocalDateTime updatedAt;
    @OneToMany(mappedBy="batchRecipe", cascade=CascadeType.ALL, orphanRemoval=true, orderBy="lineNumber ASC")
    private List<RecipeIngredientLine> ingredientLines = new ArrayList<>();
    @OneToMany(mappedBy="batchRecipe", cascade=CascadeType.ALL, orphanRemoval=true, orderBy="stepNumber ASC")
    private List<RecipeProcedureStep> procedureSteps = new ArrayList<>();
    // [D] totalCost = SUM(line.quantityRu × ingredient.ruCost)
    // [D] costPerYieldUnit = totalCost / yieldQuantity
    // [R] restaurant:{id}:recipe:{id}:cost TTL 24hr
}

@Entity @Table(name = "recipe_ingredient_line")
public class RecipeIngredientLine {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="batch_recipe_id", nullable=false) private BatchRecipe batchRecipe;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="ingredient_id", nullable=false)   private Ingredient ingredient;
    @Column(name="line_number", nullable=false) private Integer lineNumber;
    @Column(name="quantity_ru", nullable=false, precision=10, scale=4) private BigDecimal quantityRu;
    // [D] ruCost → ingredient.calcRuCost() live
    // [D] extension → calcRecipeLineExtension(quantityRu, ruCost)
}

@Entity @Table(name = "recipe_procedure_step")
public class RecipeProcedureStep {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="batch_recipe_id", nullable=false) private BatchRecipe batchRecipe;
    @Column(name="step_number", nullable=false) private Integer stepNumber;
    @Column(nullable=false, columnDefinition="TEXT") private String instruction;
}

@Entity @Table(name = "menu_cost_group",
    uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id","name"}))
public class MenuCostGroup {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="restaurant_id", nullable=false) private Restaurant restaurant;
    @Column(nullable=false)          private String name;
    @Column(name="display_order")    private Integer displayOrder;
    @Column(name="is_active", nullable=false) private boolean active = true;
    @OneToMany(mappedBy="costGroup", cascade=CascadeType.ALL, orphanRemoval=true) private List<MenuItem> menuItems = new ArrayList<>();
}

@Entity @Table(name = "menu_item",
    uniqueConstraints = @UniqueConstraint(columnNames = {"cost_group_id","name"}))
public class MenuItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="cost_group_id", nullable=false) private MenuCostGroup costGroup;
    @Column(nullable=false) private String name;
    @Column(name="menu_price", nullable=false, precision=10, scale=2) private BigDecimal menuPrice;
    @Column(name="plate_cost", precision=8, scale=4)                  private BigDecimal plateCost;
    @Column(name="target_food_cost_pct", precision=5, scale=4)        private BigDecimal targetFoodCostPct;
    @Column(name="plu_number")     private Integer pluNumber;
    @Column(name="image_storage_key") private String imageStorageKey;
    @Column(name="image_alt_text")    private String imageAltText;
    @Column(name="image_version")     private Integer imageVersion;
    @Column(name="is_active", nullable=false) private boolean active = true;
    @Column(name="created_at", updatable=false) private LocalDateTime createdAt;
    @Column(name="updated_at")                  private LocalDateTime updatedAt;
    @OneToMany(mappedBy="menuItem", cascade=CascadeType.ALL, orphanRemoval=true, orderBy="lineNumber ASC")
    private List<MenuItemIngredientLine> ingredientLines = new ArrayList<>();
    @OneToOne(mappedBy="menuItem", cascade=CascadeType.ALL, orphanRemoval=true) private RecipeBuildChart buildChart;
    // [D] totalCost = SUM(lines) + plateCost, grossProfit, foodCostPct, targetPrice
    // [R] restaurant:{id}:menuitem:{id}:cost TTL 24hr
}

@Entity @Table(name = "menu_item_ingredient_line")
public class MenuItemIngredientLine {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="menu_item_id", nullable=false) private MenuItem menuItem;
    @Column(name="line_number", nullable=false) private Integer lineNumber;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="ingredient_id")   private Ingredient ingredient;   // mutually exclusive
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="batch_recipe_id") private BatchRecipe batchRecipe; // with batchRecipe
    @Column(name="quantity_ru", nullable=false, precision=10, scale=4) private BigDecimal quantityRu;
    // [D] ruCost & extension computed from whichever FK is set
}

@Entity @Table(name = "recipe_build_chart")
public class RecipeBuildChart {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @OneToOne(fetch=FetchType.LAZY) @JoinColumn(name="menu_item_id", nullable=false, unique=true) private MenuItem menuItem;
    @Enumerated(EnumType.STRING) @Column(name="station", nullable=false) private KitchenStationType station;
    @Column(name="plating_spec")                                          private String platingSpec;
    @Column(name="updated_at")                                            private LocalDateTime updatedAt;
    @OneToMany(mappedBy="buildChart", cascade=CascadeType.ALL, orphanRemoval=true, orderBy="lineNumber ASC")
    private List<BuildChartLine> lines = new ArrayList<>();
}

@Entity @Table(name = "build_chart_line")
public class BuildChartLine {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="build_chart_id", nullable=false) private RecipeBuildChart buildChart;
    @Column(name="line_number", nullable=false) private Integer lineNumber;
    @Column(name="label", nullable=false)       private String label;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="ingredient_id") private Ingredient ingredient;
    @Column(name="portion_quantity", precision=8, scale=3) private BigDecimal portionQuantity;
    @Enumerated(EnumType.STRING) @Column(name="portion_unit") private RecipeUnit portionUnit;
    @Column(name="portion_note")  private String portionNote;
    @Enumerated(EnumType.STRING) @Column(name="serving_utensil", nullable=false) private ServingUtensil servingUtensil;
    @Column(name="utensil_note")         private String utensilNote;
    @Column(name="cross_station_note")   private String crossStationNote;
}

@Entity @Table(name = "operations_manual_entry")
public class OperationsManualEntry {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="restaurant_id", nullable=false) private Restaurant restaurant;
    @Enumerated(EnumType.STRING) @Column(name="station", nullable=false) private KitchenStationType station;
    @Column(nullable=false) private String title;
    @Column(name="display_order") private Integer displayOrder;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="batch_recipe_id") private BatchRecipe batchRecipe;
    @Column(columnDefinition="TEXT") private String content;
    @Column(name="updated_at") private LocalDateTime updatedAt;
}

// ════════════════════════════════════════════════════════════════
// ██  SUBSYSTEM 4 — MENU ENGINEERING
// ════════════════════════════════════════════════════════════════

@Entity @Table(name = "menu_engineering_period")
public class MenuEngineeringPeriod {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="restaurant_id", nullable=false) private Restaurant restaurant;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="cost_group_id") private MenuCostGroup costGroup;
    @Column(name="period_begin_date", nullable=false) private LocalDate periodBeginDate;
    @Column(name="period_end_date", nullable=false)   private LocalDate periodEndDate;
    @Column(name="popularity_factor", nullable=false, precision=4, scale=2) private BigDecimal popularityFactor;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private AnalysisStatus status;
    @Column(name="created_at", updatable=false) private LocalDateTime createdAt;
    @OneToMany(mappedBy="period", cascade=CascadeType.ALL, orphanRemoval=true)
    private List<MenuEngineeringResult> results = new ArrayList<>();
    // [R] restaurant:{id}:menu-engineering:period:{id}:results  permanent
    // [R] restaurant:{id}:menu-engineering:period:{id}:summary  permanent
    public enum AnalysisStatus { DRAFT, FINALISED }
}

@Entity @Table(name = "menu_engineering_result",
    uniqueConstraints = @UniqueConstraint(columnNames = {"period_id","menu_item_id"}))
public class MenuEngineeringResult {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="period_id", nullable=false)     private MenuEngineeringPeriod period;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="menu_item_id", nullable=false)  private MenuItem menuItem;
    @Column(name="item_name_snapshot", nullable=false) private String itemNameSnapshot;
    @Column(name="quantity_sold", nullable=false)      private Integer quantitySold;
    @Column(name="sell_price", nullable=false, precision=10, scale=2) private BigDecimal sellPrice;
    @Column(name="item_cost", nullable=false, precision=10, scale=4)  private BigDecimal itemCost;
    // [D] itemGrossProfit, salesMixPct, totalCost, totalRevenue, totalProfit
    // [D] grossProfitCategory, salesMixCategory, classification  → all via ConversionFunctions
}

// ════════════════════════════════════════════════════════════════
// ██  POS LAYER — Tables · Sessions · Orders · Lines
// ════════════════════════════════════════════════════════════════

@Entity @Table(name = "dining_table",
    uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id","table_number"}))
public class DiningTable {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="restaurant_id", nullable=false) private Restaurant restaurant;
    @Column(name="table_number", nullable=false) private String tableNumber;
    @Column(name="seat_capacity") private Integer seatCapacity;
    @Enumerated(EnumType.STRING) @Column(name="section", nullable=false) private TableSection section;
    @Column(name="is_active", nullable=false) private boolean active = true;
    public enum TableSection { INDOOR, OUTDOOR, BAR, PRIVATE, TAKEAWAY, DELIVERY }
}

@Entity @Table(name = "table_session")
public class TableSession {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="dining_table_id", nullable=false) private DiningTable diningTable;
    @Column(name="opened_at", nullable=false) private LocalDateTime openedAt;
    @Column(name="closed_at")                 private LocalDateTime closedAt;
    @Column(name="guest_count", nullable=false) private Integer guestCount;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private SessionStatus status;
    @Column(name="closed_by_user_id") private Long closedByUserId;
    @OneToMany(mappedBy="tableSession", cascade=CascadeType.ALL, orphanRemoval=true)
    private List<Order> orders = new ArrayList<>();
    // [D] durationMinutes, coversToday, peakHour heatmap, salesPerCover
    // [R] restaurant:{id}:sessions:live  event-driven, no TTL
    // [R] restaurant:{id}:kpis:today  TTL 5min
    public enum SessionStatus { OPEN, CLOSED, VOID }
}

@Entity @Table(name = "restaurant_order")
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="table_session_id", nullable=false) private TableSession tableSession;
    @Column(name="ordered_at", nullable=false) private LocalDateTime orderedAt;
    @Column(name="closed_at")                  private LocalDateTime closedAt;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private OrderStatus status;
    @Column(name="created_by_user_id") private Long createdByUserId;
    @OneToMany(mappedBy="order", cascade=CascadeType.ALL, orphanRemoval=true)
    private List<OrderLine> lines = new ArrayList<>();
    // [D] orderTotal, checkAverage, salesByCategory
    // [R] restaurant:{id}:kpis:today, restaurant:{id}:kpis:week:{date}
    public enum OrderStatus { OPEN, FIRED, CLOSED, VOID }
}

@Entity @Table(name = "order_line")
public class OrderLine {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="order_id", nullable=false)      private Order order;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="menu_item_id", nullable=false)  private MenuItem menuItem;
    @Column(nullable=false) private Integer quantity;
    @Column(name="price_at_order", nullable=false, precision=10, scale=2) private BigDecimal priceAtOrder;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private OrderLineStatus status;
    @Column(name="created_at", updatable=false) private LocalDateTime createdAt;
    // [D] lineTotal = priceAtOrder × quantity
    // [D] theoreticalCost = menuItem.totalCost × quantity (feeds prime cost)
    // [R] restaurant:{id}:menu-engineering:live:{costGroupId}  TTL 5min
    // [R] restaurant:{id}:top-sellers:today  TTL 5min
    // [R] restaurant:{id}:sales:daily:{date}:by-category  TTL 5min live / 24hr past
    public enum OrderLineStatus { ORDERED, VOIDED, COMPED }
}

@Entity @Table(name = "guest_count_entry",
    uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id","week_start_date","time_slot"}))
public class GuestCountEntry {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="restaurant_id", nullable=false) private Restaurant restaurant;
    @Column(name="week_start_date", nullable=false) private LocalDate weekStartDate;
    @Column(name="time_slot", nullable=false)        private LocalTime timeSlot;
    @Column(name="slot_label")   private String slotLabel;
    @Column(name="count_mon")    private Integer countMon;
    @Column(name="count_tue")    private Integer countTue;
    @Column(name="count_wed")    private Integer countWed;
    @Column(name="count_thu")    private Integer countThu;
    @Column(name="count_fri")    private Integer countFri;
    @Column(name="count_sat")    private Integer countSat;
    @Column(name="count_sun")    private Integer countSun;
    // [D] weeklyTotal, weeklyAverage, 3-week rolling avg via AVG() query
}

// ════════════════════════════════════════════════════════════════
// ██  PRIME COST LAYER — Labor · Shifts · Weekly Prime Cost
// ════════════════════════════════════════════════════════════════

/** Master employee record */
@Entity @Table(name = "employee",
    uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id","name"}))
public class Employee {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="restaurant_id", nullable=false) private Restaurant restaurant;
    @Column(nullable=false) private String name;
    @Enumerated(EnumType.STRING) @Column(name="employee_type", nullable=false) private EmployeeType employeeType;
    @Column(name="hourly_rate", precision=8, scale=2) private BigDecimal hourlyRate; // null for salaried
    @Column(name="annual_salary", precision=12, scale=2) private BigDecimal annualSalary; // null for hourly
    @Column(name="is_active", nullable=false) private boolean active = true;
    @Column(name="created_at", updatable=false) private LocalDateTime createdAt;
    public enum EmployeeType { MANAGEMENT, HOURLY }
}

/**
 * Daily hours + cost for one hourly employee in one week.
 * Overtime logic: daily cost = rate × hours, but hours > 40/week → 1.5× on excess.
 * [D] totalCost, dailyCosts — computed from hours × rate with overtime flag
 */
@Entity @Table(name = "employee_labor_record",
    uniqueConstraints = @UniqueConstraint(columnNames = {"employee_id","week_start_date"}))
public class EmployeeLaborRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="employee_id", nullable=false) private Employee employee;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="restaurant_id", nullable=false) private Restaurant restaurant;
    @Column(name="week_start_date", nullable=false) private LocalDate weekStartDate;

    // Daily hours — entered per day
    @Column(name="hours_mon", precision=5,scale=2) private BigDecimal hoursMon;
    @Column(name="hours_tue", precision=5,scale=2) private BigDecimal hoursTue;
    @Column(name="hours_wed", precision=5,scale=2) private BigDecimal hoursWed;
    @Column(name="hours_thu", precision=5,scale=2) private BigDecimal hoursThu;
    @Column(name="hours_fri", precision=5,scale=2) private BigDecimal hoursFri;
    @Column(name="hours_sat", precision=5,scale=2) private BigDecimal hoursSat;
    @Column(name="hours_sun", precision=5,scale=2) private BigDecimal hoursSun;

    // Rate snapshot at time of entry (hourly employees only)
    @Column(name="rate_snapshot", precision=8, scale=2) private BigDecimal rateSnapshot;

    // [D] totalHours = SUM(hoursMon..hoursSun)
    // [D] dailyCosts with overtime premium after 40hrs
    // [D] totalCost = SUM(dailyCosts)

    @Column(name="created_at", updatable=false) private LocalDateTime createdAt;
    @Column(name="updated_at") private LocalDateTime updatedAt;
}

/**
 * Scheduled (planned) shift — enables Scheduled vs Actual labor comparison.
 * Added as part of the Prime Cost next level.
 */
@Entity @Table(name = "scheduled_shift")
public class ScheduledShift {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="employee_id", nullable=false)   private Employee employee;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="restaurant_id", nullable=false) private Restaurant restaurant;
    @Column(name="shift_date", nullable=false)               private LocalDate shiftDate;
    @Column(name="start_time", nullable=false)               private LocalTime startTime;
    @Column(name="end_time", nullable=false)                 private LocalTime endTime;
    @Enumerated(EnumType.STRING) @Column(name="station")     private KitchenStationType station;
    @Column(name="notes", length=200)                        private String notes;
    @Column(name="created_at", updatable=false)              private LocalDateTime createdAt;
    // [D] scheduledHours = endTime − startTime
    // [D] scheduledCost  = scheduledHours × employee.hourlyRate
}

/**
 * Weekly budget targets — used in Prime Cost Report for Actual vs Budget.
 * One record per restaurant per week.
 */
@Entity @Table(name = "weekly_budget",
    uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id","week_start_date"}))
public class WeeklyBudget {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="restaurant_id", nullable=false) private Restaurant restaurant;
    @Column(name="week_start_date", nullable=false) private LocalDate weekStartDate;

    // Sales forecasts as % of total (user enters totalSalesForecast + these %)
    @Column(name="total_sales_forecast", precision=12, scale=2) private BigDecimal totalSalesForecast;
    @Column(name="food_sales_pct", precision=5, scale=4)        private BigDecimal foodSalesPct;
    @Column(name="soft_bev_sales_pct", precision=5, scale=4)    private BigDecimal softBevSalesPct;
    @Column(name="liquor_sales_pct", precision=5, scale=4)      private BigDecimal liquorSalesPct;
    @Column(name="bottle_beer_sales_pct", precision=5, scale=4) private BigDecimal bottleBeerSalesPct;
    @Column(name="draft_beer_sales_pct", precision=5, scale=4)  private BigDecimal draftBeerSalesPct;
    @Column(name="wine_sales_pct", precision=5, scale=4)        private BigDecimal wineSalesPct;
    @Column(name="comps_pct", precision=5, scale=4)             private BigDecimal compsPct;

    // COS % targets per category
    @Column(name="food_cos_pct_target", precision=5, scale=4)    private BigDecimal foodCosPctTarget;
    @Column(name="bev_cos_pct_target", precision=5, scale=4)     private BigDecimal bevCosPctTarget;

    // Labor % targets
    @Column(name="mgmt_labor_pct_target", precision=5, scale=4)   private BigDecimal mgmtLaborPctTarget;
    @Column(name="hourly_labor_pct_target", precision=5, scale=4) private BigDecimal hourlyLaborPctTarget;
    @Column(name="benefits_rate", precision=5, scale=4)           private BigDecimal benefitsRate; // e.g. 0.22

    // [D] all $ amounts derived from totalSalesForecast × respective pct
    // [D] budgetPrimeCostPct = foodCosTarget + bevCosTarget + laborTarget
    @Column(name="created_at", updatable=false) private LocalDateTime createdAt;
    @Column(name="updated_at") private LocalDateTime updatedAt;
}

/**
 * Saved prime cost report snapshot — frozen at period close.
 * Actuals pulled from OrderLine (revenue), PurchaseInvoice (COGS),
 * InventoryPeriod (beg/end), EmployeeLaborRecord (labor).
 */
@Entity @Table(name = "prime_cost_report",
    uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id","week_start_date"}))
public class PrimeCostReport {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="restaurant_id", nullable=false) private Restaurant restaurant;
    @Column(name="week_start_date", nullable=false) private LocalDate weekStartDate;

    // ── Revenue (actuals from OrderLine) ──────────────────────
    @Column(name="gross_sales", precision=12, scale=2)       private BigDecimal grossSales;
    @Column(name="comps_discounts", precision=12, scale=2)   private BigDecimal compsDiscounts;
    @Column(name="net_sales", precision=12, scale=2)         private BigDecimal netSales;

    // ── Actual COGS ───────────────────────────────────────────
    @Column(name="beg_inventory_food", precision=12, scale=2) private BigDecimal begInventoryFood;
    @Column(name="end_inventory_food", precision=12, scale=2) private BigDecimal endInventoryFood;
    @Column(name="purchases_food", precision=12, scale=2)     private BigDecimal purchasesFood;
    @Column(name="actual_food_cos", precision=12, scale=2)    private BigDecimal actualFoodCos;
    // [D] actualFoodCos = begInventoryFood + purchasesFood − endInventoryFood

    @Column(name="beg_inventory_bev", precision=12, scale=2)  private BigDecimal begInventoryBev;
    @Column(name="end_inventory_bev", precision=12, scale=2)  private BigDecimal endInventoryBev;
    @Column(name="purchases_bev", precision=12, scale=2)      private BigDecimal purchasesBev;
    @Column(name="actual_bev_cos", precision=12, scale=2)     private BigDecimal actualBevCos;

    @Column(name="total_actual_cos", precision=12, scale=2)   private BigDecimal totalActualCos;
    @Column(name="total_actual_cos_pct", precision=6, scale=4) private BigDecimal totalActualCosPct;

    // ── Theoretical COGS (from OrderLine × recipe costs) ─────
    @Column(name="theoretical_cos", precision=12, scale=2)    private BigDecimal theoreticalCos;
    @Column(name="theoretical_cos_pct", precision=6, scale=4) private BigDecimal theoreticalCosPct;

    // ── Shrinkage Variance ────────────────────────────────────
    @Column(name="shrinkage_variance", precision=12, scale=2)    private BigDecimal shrinkageVariance;
    @Column(name="shrinkage_variance_pct", precision=6, scale=4) private BigDecimal shrinkageVariancePct;
    // [D] shrinkageVariance = actualCos − theoreticalCos

    // ── Labor ─────────────────────────────────────────────────
    @Column(name="mgmt_labor", precision=12, scale=2)          private BigDecimal mgmtLabor;
    @Column(name="hourly_labor", precision=12, scale=2)        private BigDecimal hourlyLabor;
    @Column(name="payroll_taxes_benefits", precision=12, scale=2) private BigDecimal payrollTaxesBenefits;
    @Column(name="total_labor", precision=12, scale=2)         private BigDecimal totalLabor;
    @Column(name="total_labor_pct", precision=6, scale=4)      private BigDecimal totalLaborPct;

    // ── Prime Cost ────────────────────────────────────────────
    @Column(name="prime_cost_gross", precision=12, scale=2)    private BigDecimal primeCostGross;
    @Column(name="prime_cost_gross_pct", precision=6, scale=4) private BigDecimal primeCostGrossPct;
    @Column(name="prime_cost_net", precision=12, scale=2)      private BigDecimal primeCostNet;
    @Column(name="prime_cost_net_pct", precision=6, scale=4)   private BigDecimal primeCostNetPct;
    @Column(name="gross_margin", precision=12, scale=2)        private BigDecimal grossMargin;
    @Column(name="gross_margin_pct", precision=6, scale=4)     private BigDecimal grossMarginPct;

    // ── Scheduled vs Actual Labor ─────────────────────────────
    @Column(name="scheduled_labor", precision=12, scale=2)     private BigDecimal scheduledLabor;
    @Column(name="labor_variance", precision=12, scale=2)      private BigDecimal laborVariance;
    // [D] laborVariance = actualLabor − scheduledLabor

    // ── KPIs ─────────────────────────────────────────────────
    @Column(name="total_covers")                               private Integer    totalCovers;
    @Column(name="check_average", precision=8, scale=2)        private BigDecimal checkAverage;
    @Column(name="labor_cost_per_cover", precision=8, scale=2) private BigDecimal laborCostPerCover;
    @Column(name="sales_per_labor_hour", precision=8, scale=2) private BigDecimal salesPerLaborHour;

    @Enumerated(EnumType.STRING) @Column(nullable=false) private ReportStatus status;
    @Column(name="created_at", updatable=false) private LocalDateTime createdAt;
    @Column(name="updated_at")                  private LocalDateTime updatedAt;
    public enum ReportStatus { DRAFT, FINALISED }
}

/**
 * Daily sales entry — manual fallback for non-POS restaurants.
 * For POS restaurants this is auto-populated from OrderLine aggregates.
 */
@Entity @Table(name = "daily_sales_entry",
    uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id","sales_date"}))
public class DailySalesEntry {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="restaurant_id", nullable=false) private Restaurant restaurant;
    @Column(name="sales_date", nullable=false) private LocalDate salesDate;
    @Column(name="food_sales", precision=12, scale=2)        private BigDecimal foodSales;
    @Column(name="soft_bev_sales", precision=12, scale=2)    private BigDecimal softBevSales;
    @Column(name="liquor_sales", precision=12, scale=2)      private BigDecimal liquorSales;
    @Column(name="bottle_beer_sales", precision=12, scale=2) private BigDecimal bottleBeerSales;
    @Column(name="draft_beer_sales", precision=12, scale=2)  private BigDecimal draftBeerSales;
    @Column(name="wine_sales", precision=12, scale=2)        private BigDecimal wineSales;
    @Column(name="merch_sales", precision=12, scale=2)       private BigDecimal merchSales;
    @Column(name="comps_discounts", precision=12, scale=2)   private BigDecimal compsDiscounts;
    @Column(name="guest_count")                              private Integer    guestCount;
    @Column(name="source", nullable=false)                   private String     source; // "POS" or "MANUAL"
    @Column(name="created_at", updatable=false)              private LocalDateTime createdAt;
    // [D] grossSales, netSales, checkAverage all derived
}