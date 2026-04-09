// ============================================================
// JPA ENTITIES  — Subsystems 1–4  +  POS Layer
// Version 3 — adds DiningTable, TableSection, TableSession,
//              Order, OrderLine, and full Redis cache notes.
//
// Legend:
//  [K]  persisted in PostgreSQL
//  [D]  derived — computed in service layer, never stored in DB
//  [R]  cached in Redis — has a service + REST endpoint
//  [E]  enum replaces free String
//  [M]  merged into another entity
// ============================================================

package com.restaurant.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// ─────────────────────────────────────────────────────────────
// ██  SHARED / CROSS-CUTTING
// ─────────────────────────────────────────────────────────────

/**
 * [K] Root tenant entity — every other entity hangs off this.
 */
@Entity
@Table(name = "restaurant")
public class Restaurant {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    /** IANA timezone string e.g. "America/New_York", "Europe/London" */
    @Column(name = "timezone", nullable = false)
    private String timezone;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /*
     * [R] Redis keys scoped to this restaurant:
     *   restaurant:{id}:dashboard          → DashboardSummaryDto
     *   restaurant:{id}:kpis:today         → TodayKpiDto
     *   restaurant:{id}:kpis:week:{date}   → WeekKpiDto
     * TTL: 5 min for live KPIs, 1 hr for weekly summaries.
     * Invalidated on: any Order closed, any Invoice posted.
     */
}

/**
 * [K] A supplier / vendor master record.
 */
@Entity
@Table(name = "supplier",
       uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id", "name"}))
public class Supplier {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(nullable = false)
    private String name;

    @Column(name = "contact_name")
    private String contactName;

    @Column
    private String phone;

    @Column
    private String email;

    @Column(name = "account_number")
    private String accountNumber;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}


// ─────────────────────────────────────────────────────────────
// ██  SUBSYSTEM 1 — INVENTORY MANAGEMENT
// ─────────────────────────────────────────────────────────────

/**
 * [K] Master catalogue entry for one purchasable ingredient.
 *
 * Only source/input values are stored.
 * All cost calculations are pure functions in ConversionFunctions.
 *
 * [D] ruCost  = purchaseUnitPrice / ruPerPu / yieldPct
 * [D] iuCost  = purchaseUnitPrice / iuPerPu
 *
 * [R] Redis key: restaurant:{id}:ingredient:{id}:costs
 *     → { ruCost, iuCost }
 *     TTL: 24 hr.
 *     Invalidated when: purchaseUnitPrice, ruPerPu, yieldPct, or iuPerPu changes.
 *     Endpoint: GET /api/ingredients/{id}/costs
 *     (Hot path — called on every recipe cost card load.)
 */
@Entity
@Table(name = "ingredient",
       uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id", "item_code"}))
public class Ingredient {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(name = "item_code", nullable = false, length = 6)
    private String itemCode;

    @Column(nullable = false)
    private String description;

    // ── Classification ────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "inventory_type", nullable = false)
    private InventoryType inventoryType;               // [E] FOOD | BAR

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InventoryCategory category;                // [E] MEAT | SEAFOOD | LIQUOR …

    // ── Purchase unit ─────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "purchase_unit", nullable = false)
    private PurchaseUnit purchaseUnit;                 // [E] LB | CASE | BOTTLE | KEG …

    @Column(name = "case_pack_size")
    private String casePackSize;                       // e.g. "6/5-lb. tin"

    @Column(name = "purchase_unit_price", nullable = false, precision = 10, scale = 4)
    private BigDecimal purchaseUnitPrice;

    // ── Recipe unit ───────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "recipe_unit", nullable = false)
    private RecipeUnit recipeUnit;                     // [E] OZ_WEIGHT | CUP | EACH …

    @Column(name = "ru_per_pu", nullable = false, precision = 10, scale = 4)
    private BigDecimal ruPerPu;

    @Column(name = "yield_pct", nullable = false, precision = 6, scale = 4)
    private BigDecimal yieldPct;

    // ── Inventory unit ────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "inventory_unit", nullable = false)
    private InventoryUnit inventoryUnit;               // [E] LB | EACH | BOTTLE …

    @Column(name = "iu_per_pu", nullable = false, precision = 10, scale = 4)
    private BigDecimal iuPerPu;

    // ── Density (volume ↔ weight conversion) ──────────────────
    @Column(name = "oz_weight_per_cup", precision = 8, scale = 4)
    private BigDecimal ozWeightPerCup;                 // null for pure-weight or piece items

    @Enumerated(EnumType.STRING)
    @Column(name = "packed_by")
    private PackedBy packedBy;                         // [E] WEIGHT | VOLUME

    // ── Par level ─────────────────────────────────────────────
    @Column(name = "par_level", precision = 10, scale = 3)
    private BigDecimal parLevel;

    // ── Image ─────────────────────────────────────────────────
    @Column(name = "image_storage_key")
    private String imageStorageKey;                    // object-storage key, NOT a full URL

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

/**
 * [K] Header for one inventory count event.
 * FOOD and BAR are separate periods.
 *
 * [R] Redis key: restaurant:{id}:inventory:latest:{FOOD|BAR}
 *     → { periodDate, totalValue, categoryBreakdown[] }
 *     TTL: until next period is FINALISED.
 *     Endpoint: GET /api/inventory/periods/latest?type=FOOD
 */
@Entity
@Table(name = "inventory_period",
       uniqueConstraints = @UniqueConstraint(
               columnNames = {"restaurant_id", "period_date", "inventory_type"}))
public class InventoryPeriod {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(name = "period_date", nullable = false)
    private LocalDate periodDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "inventory_type", nullable = false)
    private InventoryType inventoryType;               // [E] FOOD | BAR

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PeriodStatus status;                       // [E] OPEN | FINALISED

    @Column(name = "finalised_at")
    private LocalDateTime finalisedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "inventoryPeriod", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InventoryLineItem> lineItems = new ArrayList<>();

    /*
     * [D] totalValue          = SUM(count × iuCost per line)
     * [D] categoryBreakdown   = GROUP BY ingredient.category
     * [D] belowParItems       = WHERE count < ingredient.parLevel
     * All three served from Redis when status = FINALISED.
     */

    public enum PeriodStatus { OPEN, FINALISED }
}

/**
 * [K] One counted line — physical count only.
 * Cost is always computed live from Ingredient master.
 */
@Entity
@Table(name = "inventory_line_item",
       uniqueConstraints = @UniqueConstraint(
               columnNames = {"inventory_period_id", "ingredient_id"}))
public class InventoryLineItem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_period_id", nullable = false)
    private InventoryPeriod inventoryPeriod;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal count;

    // [D] extension = count × calcIuCost(ingredient) → ConversionFunctions.calcExtension()
}


// ─────────────────────────────────────────────────────────────
// ██  SUBSYSTEM 2 — PURCHASING & INVOICE MANAGEMENT
// ─────────────────────────────────────────────────────────────

/**
 * [K] One supplier invoice header.
 *
 * [D] proof = invoiceAmount − SUM(lines.amount) → calcInvoiceProof()
 *
 * [R] Redis key: restaurant:{id}:purchases:week:{weekStartDate}
 *     → { totalByCategory{}, grandTotal, invoiceCount }
 *     TTL: 1 hr.
 *     Invalidated when: any invoice for that week is POSTED or VOID.
 *     Endpoint: GET /api/purchases/weekly-summary?weekStart=2024-01-01
 */
@Entity
@Table(name = "purchase_invoice")
public class PurchaseInvoice {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate;

    @Column(name = "invoice_number")
    private String invoiceNumber;

    @Column(name = "invoice_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal invoiceAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvoiceStatus status;                      // [E] DRAFT | POSTED | VOID

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseInvoiceLine> lines = new ArrayList<>();

    public enum InvoiceStatus { DRAFT, POSTED, VOID }
}

/**
 * [K] One category allocation line on an invoice.
 * Replaces the 8 flat category columns — fully normalised.
 */
@Entity
@Table(name = "purchase_invoice_line",
       uniqueConstraints = @UniqueConstraint(
               columnNames = {"invoice_id", "purchase_category"}))
public class PurchaseInvoiceLine {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private PurchaseInvoice invoice;

    @Enumerated(EnumType.STRING)
    @Column(name = "purchase_category", nullable = false)
    private PurchaseCategory purchaseCategory;         // [E] FOOD | LIQUOR | WINE …

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    // [D] pct of invoice total = amount / invoice.invoiceAmount  → DTO layer
}


// ─────────────────────────────────────────────────────────────
// ██  SUBSYSTEM 3 — RECIPE & MENU COSTING
// ─────────────────────────────────────────────────────────────

/**
 * [K] A batch / sub-recipe (sauce, marinade, prep).
 *
 * [D] totalCost         = SUM(lines: quantityRu × ruCost)
 * [D] costPerYieldUnit  = totalCost / yieldQuantity
 *
 * [R] Redis key: restaurant:{id}:recipe:{id}:cost
 *     → { totalCost, costPerYieldUnit, lineBreakdown[] }
 *     TTL: 24 hr.
 *     Invalidated when: any ingredient price changes, or any line is edited.
 *     Endpoint: GET /api/recipes/{id}/cost
 */
@Entity
@Table(name = "batch_recipe",
       uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id", "name"}))
public class BatchRecipe {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "station", nullable = false)
    private KitchenStationType station;                // [E] LINE_COOK | PREP_COOK …

    @Enumerated(EnumType.STRING)
    @Column(name = "shelf_life")
    private ShelfLife shelfLife;                       // [E] ONE_SHIFT | THREE_DAYS …

    @Column(name = "tools_equipment", length = 500)
    private String toolsEquipment;

    @Column(name = "position_notes", length = 500)
    private String positionNotes;

    @Column(name = "yield_quantity", nullable = false, precision = 10, scale = 3)
    private BigDecimal yieldQuantity;

    @Enumerated(EnumType.STRING)
    @Column(name = "yield_unit", nullable = false)
    private RecipeUnit yieldUnit;                      // [E] OZ_WEIGHT | CUP | EACH …

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "batchRecipe", cascade = CascadeType.ALL,
               orphanRemoval = true, orderBy = "lineNumber ASC")
    private List<RecipeIngredientLine> ingredientLines = new ArrayList<>();

    @OneToMany(mappedBy = "batchRecipe", cascade = CascadeType.ALL,
               orphanRemoval = true, orderBy = "stepNumber ASC")
    private List<RecipeProcedureStep> procedureSteps = new ArrayList<>();
}

/**
 * [K] One ingredient line inside a batch recipe.
 * ruCost is always pulled live from Ingredient — never stored here.
 */
@Entity
@Table(name = "recipe_ingredient_line")
public class RecipeIngredientLine {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_recipe_id", nullable = false)
    private BatchRecipe batchRecipe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @Column(name = "line_number", nullable = false)
    private Integer lineNumber;

    @Column(name = "quantity_ru", nullable = false, precision = 10, scale = 4)
    private BigDecimal quantityRu;

    // [D] ruCost    → calcRuCost(ingredient) at read time
    // [D] extension → calcRecipeLineExtension(quantityRu, ruCost) at read time
}

/**
 * [K] One numbered procedure step on a batch recipe.
 * Individual rows enable drag-to-reorder in the UI.
 */
@Entity
@Table(name = "recipe_procedure_step")
public class RecipeProcedureStep {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_recipe_id", nullable = false)
    private BatchRecipe batchRecipe;

    @Column(name = "step_number", nullable = false)
    private Integer stepNumber;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String instruction;
}

/**
 * [K] Logical grouping of menu items for costing and engineering.
 * e.g. "Blue Plates", "Appetizers", "Bar Menu".
 */
@Entity
@Table(name = "menu_cost_group",
       uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id", "name"}))
public class MenuCostGroup {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(nullable = false)
    private String name;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @OneToMany(mappedBy = "costGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MenuItem> menuItems = new ArrayList<>();
}

/**
 * [K] A menu item with its costing inputs.
 *
 * [D] totalCost      = SUM(ingredient lines) + plateCost
 * [D] grossProfit    = menuPrice − totalCost
 * [D] foodCostPct    = totalCost / menuPrice
 * [D] targetPrice    = totalCost / targetFoodCostPct
 *
 * [R] Redis key: restaurant:{id}:menuitem:{id}:cost
 *     → { totalCost, grossProfit, foodCostPct, targetPrice }
 *     TTL: 24 hr.
 *     Invalidated when: any ingredient price changes, line added/removed,
 *                       plateCost or menuPrice edited.
 *     Endpoint: GET /api/menu-items/{id}/cost
 *
 * [R] Redis key: restaurant:{id}:costgroup:{id}:cost-summary
 *     → [ { menuItemId, name, totalCost, menuPrice, foodCostPct } ]
 *     TTL: 1 hr.
 *     Endpoint: GET /api/cost-groups/{id}/cost-summary
 */
@Entity
@Table(name = "menu_item",
       uniqueConstraints = @UniqueConstraint(columnNames = {"cost_group_id", "name"}))
public class MenuItem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cost_group_id", nullable = false)
    private MenuCostGroup costGroup;

    @Column(nullable = false)
    private String name;

    @Column(name = "menu_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal menuPrice;

    @Column(name = "plate_cost", precision = 8, scale = 4)
    private BigDecimal plateCost;

    @Column(name = "target_food_cost_pct", precision = 5, scale = 4)
    private BigDecimal targetFoodCostPct;

    @Column(name = "plu_number")
    private Integer pluNumber;

    // ── Image ─────────────────────────────────────────────────
    /**
     * Object-storage key — never a full URL.
     * e.g. "menu-items/restaurant-42/grilled-salmon-v2.webp"
     * Full URL assembled in service layer: cdnBase + key + "?v=" + imageVersion
     */
    @Column(name = "image_storage_key")
    private String imageStorageKey;

    @Column(name = "image_alt_text")
    private String imageAltText;

    /** Increment on each image replacement to bust CDN cache. */
    @Column(name = "image_version")
    private Integer imageVersion;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "menuItem", cascade = CascadeType.ALL,
               orphanRemoval = true, orderBy = "lineNumber ASC")
    private List<MenuItemIngredientLine> ingredientLines = new ArrayList<>();

    @OneToOne(mappedBy = "menuItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private RecipeBuildChart buildChart;
}

/**
 * [K] One costing line on a menu item.
 * References either a raw Ingredient OR a BatchRecipe — not both.
 */
@Entity
@Table(name = "menu_item_ingredient_line")
public class MenuItemIngredientLine {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @Column(name = "line_number", nullable = false)
    private Integer lineNumber;

    /** Mutually exclusive with batchRecipe */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id")
    private Ingredient ingredient;

    /** Mutually exclusive with ingredient */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_recipe_id")
    private BatchRecipe batchRecipe;

    @Column(name = "quantity_ru", nullable = false, precision = 10, scale = 4)
    private BigDecimal quantityRu;

    // [D] ruCost & extension computed from whichever FK is populated
}

/**
 * [K] Build chart / station card for one menu item.
 */
@Entity
@Table(name = "recipe_build_chart")
public class RecipeBuildChart {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false, unique = true)
    private MenuItem menuItem;

    @Enumerated(EnumType.STRING)
    @Column(name = "station", nullable = false)
    private KitchenStationType station;                // [E] LINE_COOK | PREP_COOK …

    @Column(name = "plating_spec")
    private String platingSpec;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "buildChart", cascade = CascadeType.ALL,
               orphanRemoval = true, orderBy = "lineNumber ASC")
    private List<BuildChartLine> lines = new ArrayList<>();
}

/**
 * [K] One line on a build chart.
 * Portion is structured (quantity + unit) rather than a free String.
 */
@Entity
@Table(name = "build_chart_line")
public class BuildChartLine {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "build_chart_id", nullable = false)
    private RecipeBuildChart buildChart;

    @Column(name = "line_number", nullable = false)
    private Integer lineNumber;

    /** Display label on the card — can differ from ingredient name */
    @Column(name = "label", nullable = false)
    private String label;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id")
    private Ingredient ingredient;                     // optional FK

    // ── Structured portion ────────────────────────────────────
    @Column(name = "portion_quantity", precision = 8, scale = 3)
    private BigDecimal portionQuantity;                // 6 | 2 | 3

    @Enumerated(EnumType.STRING)
    @Column(name = "portion_unit")
    private RecipeUnit portionUnit;                    // [E] OZ_WEIGHT | OZ_FLUID | EACH …
                                                       // null → see portionNote

    /** Used when portionUnit is null: "to taste", "to cover", "as needed" */
    @Column(name = "portion_note")
    private String portionNote;

    // ── Serving utensil ───────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "serving_utensil", nullable = false)
    private ServingUtensil servingUtensil;             // [E] NONE | SCOOP_32 | LADLE_2OZ …

    /** Used only when servingUtensil = CUSTOM */
    @Column(name = "utensil_note")
    private String utensilNote;

    @Column(name = "cross_station_note")
    private String crossStationNote;
}

/**
 * [K] Operations manual section — free-form or linked to a BatchRecipe.
 */
@Entity
@Table(name = "operations_manual_entry")
public class OperationsManualEntry {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Enumerated(EnumType.STRING)
    @Column(name = "station", nullable = false)
    private KitchenStationType station;

    @Column(nullable = false)
    private String title;

    @Column(name = "display_order")
    private Integer displayOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_recipe_id")
    private BatchRecipe batchRecipe;                   // null → use content field

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}


// ─────────────────────────────────────────────────────────────
// ██  POS LAYER — Tables, Sessions, Orders, Order Lines
// ─────────────────────────────────────────────────────────────

/**
 * [K] A physical or virtual table in the restaurant.
 * "Virtual" covers: bar seat, takeaway counter, online order, delivery.
 */
@Entity
@Table(name = "dining_table",
       uniqueConstraints = @UniqueConstraint(
               columnNames = {"restaurant_id", "table_number"}))
public class DiningTable {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    /** Human-facing label: "T1", "Bar-3", "Patio-2", "Online" */
    @Column(name = "table_number", nullable = false)
    private String tableNumber;

    @Column(name = "seat_capacity")
    private Integer seatCapacity;

    @Enumerated(EnumType.STRING)
    @Column(name = "section", nullable = false)
    private TableSection section;                      // [E] INDOOR | OUTDOOR | BAR | PRIVATE | TAKEAWAY | DELIVERY

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    public enum TableSection {
        INDOOR, OUTDOOR, BAR, PRIVATE, TAKEAWAY, DELIVERY
    }
}

/**
 * [K] One guest visit at a table.
 * Opened when guests are seated, closed when they pay.
 *
 * [D] durationMinutes = closedAt − openedAt           → DTO layer
 *
 * [R] Redis key: restaurant:{id}:sessions:live
 *     → [ { tableId, tableNumber, guestCount, openedAt, orderCount } ]
 *     TTL: no expiry — updated on every session open/close.
 *     Endpoint: GET /api/sessions/live   (floor map / live view)
 *
 * [R] Redis key: restaurant:{id}:kpis:today
 *     Includes: coversToday, avgTableTurnMinutes, peakHour
 *     TTL: 5 min.
 *     Invalidated on: any session closed today.
 *     Endpoint: GET /api/kpis/today
 */
@Entity
@Table(name = "table_session")
public class TableSession {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dining_table_id", nullable = false)
    private DiningTable diningTable;

    @Column(name = "opened_at", nullable = false)
    private LocalDateTime openedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;                    // null while session is OPEN

    /** Number of guests seated — entered when session opens */
    @Column(name = "guest_count", nullable = false)
    private Integer guestCount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status;                      // [E] OPEN | CLOSED | VOID

    @Column(name = "closed_by_user_id")
    private Long closedByUserId;

    @OneToMany(mappedBy = "tableSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Order> orders = new ArrayList<>();

    /*
     * [D] Insights derived from TableSession — all cached in Redis:
     *
     *   coversToday
     *     = SUM(guestCount) WHERE DATE(openedAt) = today AND status != VOID
     *     Redis: restaurant:{id}:kpis:today → coversToday
     *
     *   avgTableTurnMinutes (per section, per day-of-week)
     *     = AVG(closedAt − openedAt) WHERE status = CLOSED
     *     Redis: restaurant:{id}:kpis:turn-times:{dayOfWeek}:{section}
     *
     *   peakHour (guest count heatmap by 30-min slot)
     *     = COUNT(sessions) GROUP BY FLOOR(EXTRACT(MINUTE FROM openedAt)/30)
     *     Replaces the entire GuestCountEntry manual entry sheet.
     *     Redis: restaurant:{id}:kpis:guest-heatmap:week:{weekStartDate}
     *     Endpoint: GET /api/kpis/guest-heatmap?weekStart=2024-01-01
     *
     *   salesPerCover
     *     = SUM(order totals) / SUM(guestCount)
     *     Redis: restaurant:{id}:kpis:today → salesPerCover
     */

    public enum SessionStatus { OPEN, CLOSED, VOID }
}

/**
 * [K] One POS ticket / bill — the bridge between a session and its order lines.
 * A session can have multiple orders (e.g. drinks first, food second, dessert).
 *
 * [D] orderTotal  = SUM(lines: priceAtOrder × quantity)   → DTO layer
 * [D] checkAverage = orderTotal / session.guestCount       → DTO layer
 *
 * [R] Redis key: restaurant:{id}:kpis:today
 *     Includes: grossSalesToday, checkAvgToday
 *     Invalidated on: any order status → CLOSED.
 *     Endpoint: GET /api/kpis/today
 *
 * [R] Redis key: restaurant:{id}:kpis:week:{weekStartDate}
 *     Includes: grossSalesWeek, checkAvgWeek, totalCoversWeek
 *     TTL: 1 hr for current week, permanent for past weeks.
 *     Endpoint: GET /api/kpis/weekly?weekStart=2024-01-01
 */
@Entity
@Table(name = "restaurant_order")
public class Order {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_session_id", nullable = false)
    private TableSession tableSession;

    @Column(name = "ordered_at", nullable = false)
    private LocalDateTime orderedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;                        // [E] OPEN | FIRED | CLOSED | VOID

    @Column(name = "created_by_user_id")
    private Long createdByUserId;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderLine> lines = new ArrayList<>();

    /*
     * [D] Insights derived from Order — cached in Redis:
     *
     *   grossSalesToday / grossSalesWeek
     *     = SUM(lines.priceAtOrder × quantity) WHERE status = CLOSED
     *     Redis: restaurant:{id}:kpis:today, restaurant:{id}:kpis:week:{date}
     *
     *   salesByCategory (for Prime Cost Worksheet)
     *     = SUM(lines.priceAtOrder × qty) GROUP BY menuItem.costGroup
     *     Replaces manual DailySalesEntry completely.
     *     Redis: restaurant:{id}:sales:daily:{date}:by-category
     *     Endpoint: GET /api/sales/daily?date=2024-01-15&groupBy=category
     *
     *   checkAvgToday
     *     = grossSalesToday / coversToday
     *     Redis: restaurant:{id}:kpis:today → checkAvg
     */

    public enum OrderStatus { OPEN, FIRED, CLOSED, VOID }
}

/**
 * [K] One line on an order — one menu item, one quantity.
 * priceAtOrder is snapshotted so historical reports never change.
 *
 * [D] lineTotal = priceAtOrder × quantity → DTO layer
 *
 * [R] Redis key: restaurant:{id}:menu-engineering:live:{costGroupId}
 *     → [ { menuItemId, name, qtySoldToday, revenueToday } ]
 *     TTL: 5 min.
 *     Invalidated on: any OrderLine posted for that cost group.
 *     Endpoint: GET /api/menu-engineering/live?costGroup=1
 *     (Live sales counter — replaces manual PLU entry in engineering sheet.)
 *
 * [R] Redis key: restaurant:{id}:menu-engineering:period:{periodId}:results
 *     → Full MenuEngineeringResultDto[] with all classifications computed.
 *     TTL: permanent (only recomputed when manager clicks "Re-run Analysis").
 *     Endpoint: GET /api/menu-engineering/periods/{id}/results
 */
@Entity
@Table(name = "order_line")
public class OrderLine {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @Column(nullable = false)
    private Integer quantity;

    /** Menu price at the moment this line was added — immutable after creation */
    @Column(name = "price_at_order", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceAtOrder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderLineStatus status;                    // [E] ORDERED | VOIDED | COMPED

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /*
     * [D] Insights derived from OrderLine — the primary source for:
     *
     *   Menu Engineering quantitySold per item per period
     *     = SUM(quantity) WHERE menuItem = X AND orderedAt BETWEEN start AND end
     *                    AND status != VOIDED
     *     Replaces manual data entry on MenuEngineeringResult entirely.
     *
     *   Menu Engineering totalRevenue per item
     *     = SUM(priceAtOrder × quantity) WHERE same filters
     *
     *   Top sellers today / this week
     *     Redis: restaurant:{id}:top-sellers:today
     *            restaurant:{id}:top-sellers:week:{weekStartDate}
     *     TTL: 5 min today, 1 hr weekly.
     *     Endpoint: GET /api/analytics/top-sellers?period=today&limit=10
     *
     *   Slowest sellers (candidate LOSERs — flag for review)
     *     Redis: restaurant:{id}:slow-sellers:week:{weekStartDate}
     *     TTL: 1 hr.
     *     Endpoint: GET /api/analytics/slow-sellers?period=week
     *
     *   Revenue by cost group / category (replaces DailySalesEntry)
     *     Redis: restaurant:{id}:sales:daily:{date}:by-category
     *     TTL: 5 min during service, 24 hr for past days.
     *
     *   Food cost % live (actual cost vs actual revenue)
     *     = SUM(menuItem.totalCost × quantity) / SUM(priceAtOrder × quantity)
     *     Redis: restaurant:{id}:kpis:food-cost-pct:today
     *     TTL: 5 min.
     *     Endpoint: GET /api/kpis/food-cost?period=today
     */

    public enum OrderLineStatus { ORDERED, VOIDED, COMPED }
}


// ─────────────────────────────────────────────────────────────
// ██  SUBSYSTEM 4 — MENU ENGINEERING
// ─────────────────────────────────────────────────────────────

/**
 * [K] One saved menu engineering analysis run.
 * All input values; all results derived and served from Redis.
 *
 * Flow:
 *   1. Manager creates a period (date range + cost group + popularity factor).
 *   2. System queries OrderLine for that range — no manual entry.
 *   3. Service computes all classifications via ConversionFunctions.
 *   4. Results written to MenuEngineeringResult rows + Redis cache.
 *   5. Subsequent reads served from Redis.
 */
@Entity
@Table(name = "menu_engineering_period")
public class MenuEngineeringPeriod {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cost_group_id")                // null = all groups
    private MenuCostGroup costGroup;

    @Column(name = "period_begin_date", nullable = false)
    private LocalDate periodBeginDate;

    @Column(name = "period_end_date", nullable = false)
    private LocalDate periodEndDate;

    /** User-configurable, default 0.80 */
    @Column(name = "popularity_factor", nullable = false, precision = 4, scale = 2)
    private BigDecimal popularityFactor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnalysisStatus status;                     // [E] DRAFT | FINALISED

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "period", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MenuEngineeringResult> results = new ArrayList<>();

    /*
     * [R] Redis key: restaurant:{id}:menu-engineering:period:{id}:results
     *     → Full result set with all derived fields computed.
     *     TTL: permanent until manager re-runs analysis.
     *     Endpoint: GET /api/menu-engineering/periods/{id}/results
     *
     * [R] Redis key: restaurant:{id}:menu-engineering:period:{id}:summary
     *     → { totalSold, totalRevenue, totalProfit, avgFoodCostPct,
     *          winnerCount, workhorseCount, opportunityCount, loserCount }
     *     TTL: same as results.
     *     Endpoint: GET /api/menu-engineering/periods/{id}/summary
     */

    public enum AnalysisStatus { DRAFT, FINALISED }
}

/**
 * [K] Frozen snapshot of one item's engineering result.
 * Populated automatically from OrderLine — never entered manually.
 *
 * Only the three input snapshots are stored.
 * Everything else is [D] — computed and served from Redis.
 */
@Entity
@Table(name = "menu_engineering_result",
       uniqueConstraints = @UniqueConstraint(columnNames = {"period_id", "menu_item_id"}))
public class MenuEngineeringResult {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "period_id", nullable = false)
    private MenuEngineeringPeriod period;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    /** Name snapshot — item name may change after analysis */
    @Column(name = "item_name_snapshot", nullable = false)
    private String itemNameSnapshot;

    /** Populated from SUM(orderLine.quantity) — not entered manually */
    @Column(name = "quantity_sold", nullable = false)
    private Integer quantitySold;

    /** Sell price snapshot at analysis time */
    @Column(name = "sell_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal sellPrice;

    /** Total item cost snapshot (ingredients + plate cost) at analysis time */
    @Column(name = "item_cost", nullable = false, precision = 10, scale = 4)
    private BigDecimal itemCost;

    /*
     * [D] All derived — computed by service, stored in Redis:
     *
     *   itemGrossProfit     = sellPrice − itemCost          calcGrossProfit()
     *   salesMixPct         = quantitySold / totalSold      calcSalesMixPct()
     *   totalCost           = itemCost × quantitySold       calcItemTotalCost()
     *   totalRevenue        = sellPrice × quantitySold      calcItemTotalRevenue()
     *   totalProfit         = totalRevenue − totalCost      calcItemTotalProfit()
     *   grossProfitCategory = HIGH | LOW                    classifyGrossProfit()
     *   salesMixCategory    = HIGH | LOW                    classifySalesMix()
     *   classification      = WINNER|WORKHORSE|OPPORTUNITY|LOSER  classify()
     *
     * Redis: restaurant:{id}:menu-engineering:period:{periodId}:results
     */
}


// ─────────────────────────────────────────────────────────────
// ██  GUEST COUNT  (fallback for restaurants without POS)
// ─────────────────────────────────────────────────────────────

/**
 * [K] Manual 30-minute slot counts — only used when no POS integration exists.
 * When TableSession is in use, this table is empty and all guest count
 * data comes from TableSession.guestCount + openedAt queries.
 *
 * [R] Redis key: restaurant:{id}:kpis:guest-heatmap:week:{weekStartDate}
 *     → [ { timeSlot, avgMon, avgTue … avgSun } ]  (3-week rolling average)
 *     TTL: 1 hr.
 *     Endpoint: GET /api/guest-counts/heatmap?weekStart=2024-01-01&weeks=3
 */
@Entity
@Table(name = "guest_count_entry",
       uniqueConstraints = @UniqueConstraint(
               columnNames = {"restaurant_id", "week_start_date", "time_slot"}))
public class GuestCountEntry {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(name = "week_start_date", nullable = false)
    private LocalDate weekStartDate;

    @Column(name = "time_slot", nullable = false)
    private LocalTime timeSlot;

    @Column(name = "slot_label")
    private String slotLabel;                          // "Frokost", "Online", "Buttik"

    @Column(name = "count_mon") private Integer countMon;
    @Column(name = "count_tue") private Integer countTue;
    @Column(name = "count_wed") private Integer countWed;
    @Column(name = "count_thu") private Integer countThu;
    @Column(name = "count_fri") private Integer countFri;
    @Column(name = "count_sat") private Integer countSat;
    @Column(name = "count_sun") private Integer countSun;

    // [D] weeklyTotal   = SUM(countMon … countSun)  → DTO
    // [D] weeklyAverage = weeklyTotal / activeDays   → DTO
    // [D] 3-week rolling average → AVG() query across 3 weekStartDates → Redis
}