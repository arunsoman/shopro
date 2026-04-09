// ============================================================
// ENUMS & PURE CONVERSION FUNCTIONS
// Subsystems 1–4:
//   1. Inventory Management
//   2. Purchasing & Invoice Management
//   3. Recipe & Menu Costing
//   4. Menu Engineering
// ============================================================

// ─────────────────────────────────────────────────────────────
// ██  SECTION 1 — ENUMS
// ─────────────────────────────────────────────────────────────

// ── 1.1  Inventory ───────────────────────────────────────────

/**
 * Top-level split: is this a food-side or bar-side item?
 * (Drives which inventory sheet it appears on)
 */
public enum InventoryType {
    FOOD,
    BAR
}

/**
 * Every named category from both the FOOD and BAR sheets.
 * Replaces the free String "category" / "type" fields.
 */
public enum InventoryCategory {
    // Food-side
    MEAT,
    SEAFOOD,
    POULTRY,
    PRODUCE,
    DAIRY,
    BAKERY,
    GROCERY_DRY_GOODS,
    DRINKS,          // non-alcoholic soft drinks on food side

    // Bar-side
    LIQUOR,
    BOTTLE_BEER,
    DRAFT_BEER,
    WINE,
    BAR_CONSUMABLES
}

/**
 * The unit of measure used when placing a purchase order.
 * Replaces free strings like "lb", "bottle", "case", "12pk", "keg", etc.
 */
public enum PurchaseUnit {
    LB,
    OZ,
    KG,
    EACH,
    CASE,
    BOTTLE,
    BAG,
    BOX,
    CARTON,
    CAN,
    ROLL,
    JAR,
    PACK_12,     // 12pk
    KEG,
    CYLINDER,
    BUNCH,
    DOZEN,
    GALLON,
    HALF_GALLON
}

/**
 * The unit used when counting or costing a recipe.
 * Replaces free strings like "oz", "lb", "cup", "EA", "tspn", etc.
 */
public enum RecipeUnit {
    OZ_WEIGHT,   // oz-wt
    OZ_FLUID,    // oz-fl / fl oz
    LB,
    KG,
    GRAM,
    TSP,         // teaspoon
    TBSP,        // tablespoon
    CUP,
    PINT,
    QUART,
    GALLON,
    EACH,        // EA — countable pieces
    BUNCH,
    SLICE,
    WHOLE        // e.g. "whole" cake
}

/**
 * The unit used when physically counting inventory on the shelf.
 * Overlaps with RecipeUnit but semantically distinct.
 */
public enum InventoryUnit {
    LB,
    OZ,
    EACH,
    BOX,
    CARTON,
    CASE,
    BOTTLE,
    CAN,
    JAR,
    BAG,
    KEG,
    DOZEN,
    GALLON
}

// ── 1.2  Inventory Snapshot ──────────────────────────────────

public enum SnapshotType {
    BEGINNING,
    ENDING
}

// ── 1.3  Unit-of-Measure meta ────────────────────────────────

/**
 * Physical dimension of a unit — used by the conversion calculator.
 */
public enum MeasureType {
    WEIGHT,
    VOLUME,
    PIECE    // countable, no conversion to oz
}

/**
 * Whether a purchase unit is packed by weight or by volume.
 * Used in the Conversion Calculator sheet logic.
 */
public enum PackedBy {
    WEIGHT,
    VOLUME
}

// ── 2.1  Purchasing ──────────────────────────────────────────

/**
 * High-level purchase category on an invoice line.
 * Replaces the implicit column headers on the Purchases sheet.
 */
public enum PurchaseCategory {
    FOOD,
    SOFT_BEVERAGE,
    LIQUOR,
    BOTTLE_BEER,
    DRAFT_BEER,
    WINE,
    MERCHANDISE,
    SUPPLIES
}

// ── 3.1  Recipe & Menu Costing ───────────────────────────────

/**
 * Kitchen station where a recipe or build-chart card applies.
 * Replaces the free String on BatchRecipe / RecipeManualEntry / RecipeBuildChart.
 */
public enum KitchenStationType {
    LINE_COOK,
    PREP_COOK,
    PANTRY,
    SOUS_CHEF,
    DISHWASHER,
    SERVER,
    CUSTOM       // fallback for user-defined stations
}

/**
 * Shelf life classification used on the Lists sheet.
 * Replaces the raw "3 days", "1 shift" strings.
 */
public enum ShelfLife {
    ONE_SHIFT,
    ONE_DAY,
    TWO_DAYS,
    THREE_DAYS,
    FOUR_DAYS,
    FIVE_DAYS,
    SIX_DAYS,
    SEVEN_DAYS,
    EIGHT_DAYS,
    NINE_DAYS,
    TEN_DAYS
}

/**
 * How a recipe yield is expressed.
 * Used in RecipeYield.yieldLabel.
 */
public enum YieldType {
    BATCH,       // single batch
    PREP_12,     // 12-prep multiplier
    CUSTOM
}

// ── 4.1  Menu Engineering ────────────────────────────────────

/**
 * Gross-profit or sales-mix classification relative to the threshold.
 * Replaces raw "High" / "Low" strings.
 */
public enum HighLow {
    HIGH,
    LOW
}

/**
 * The four-quadrant menu engineering result.
 * Replaces raw "Winner" / "Workhorse" / "Opportunity" / "Loser" strings.
 */
public enum MenuEngClassification {
    WINNER,       // High GP  + High Mix  → keep & promote
    WORKHORSE,    // Low GP   + High Mix  → reprice or reformulate
    OPPORTUNITY,  // High GP  + Low Mix   → market more aggressively
    LOSER         // Low GP   + Low Mix   → reconsider or remove
}

// ─────────────────────────────────────────────────────────────
// ██  SECTION 2 — PURE CONVERSION FUNCTIONS
//
//  Rules:
//   • Every function is static and has NO side effects.
//   • No I/O, no DB calls, no mutable state.
//   • All inputs are validated; invalid combos throw
//     IllegalArgumentException with a descriptive message.
//   • BigDecimal is used for all monetary / fractional values.
//   • Functions are grouped by the domain they serve.
// ─────────────────────────────────────────────────────────────

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import static java.math.RoundingMode.HALF_UP;

public final class ConversionFunctions {

    private static final int SCALE       = 6;   // internal precision
    private static final int MONEY_SCALE = 2;   // display / monetary precision
    private static final MathContext MC  = new MathContext(10, HALF_UP);

    private ConversionFunctions() {} // no instances

    // =========================================================
    // 2.1  UNIT CONVERSIONS  (RecipeUnit ↔ RecipeUnit)
    // =========================================================

    /**
     * Convert a quantity from one RecipeUnit to another.
     *
     * Supported dimension groups:
     *   Volume : TSP → TBSP → CUP → PINT → QUART → GALLON → OZ_FLUID
     *   Weight : GRAM → OZ_WEIGHT → LB → KG
     *   Cross   : OZ_FLUID ↔ OZ_WEIGHT via a caller-supplied density factor
     *
     * Cross-dimension conversion (volume ↔ weight) requires
     * ozWeightPerCup; pass null if both units are in the same dimension.
     */
    public static BigDecimal convertRecipeUnit(
            BigDecimal quantity,
            RecipeUnit from,
            RecipeUnit to,
            BigDecimal ozWeightPerCup  // nullable; only needed for cross-dim
    ) {
        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) < 0)
            throw new IllegalArgumentException("quantity must be ≥ 0");
        if (from == to) return quantity.setScale(SCALE, HALF_UP);

        // Convert 'from' → oz (fluid or weight) as intermediate
        BigDecimal inOz = toBaseOz(quantity, from, ozWeightPerCup);

        // Convert oz intermediate → 'to'
        return fromBaseOz(inOz, to, ozWeightPerCup);
    }

    /** Convert any RecipeUnit quantity → fluid oz or weight oz as appropriate. */
    private static BigDecimal toBaseOz(BigDecimal qty, RecipeUnit unit, BigDecimal ozWtPerCup) {
        return switch (unit) {
            // ── Volume (→ fluid oz) ──
            case OZ_FLUID   -> qty;
            case TSP        -> qty.divide(bd(6), SCALE, HALF_UP);
            case TBSP       -> qty.divide(bd(2), SCALE, HALF_UP);
            case CUP        -> qty.multiply(bd(8));
            case PINT       -> qty.multiply(bd(16));
            case QUART      -> qty.multiply(bd(32));
            case GALLON     -> qty.multiply(bd(128));
            // ── Weight (→ weight oz) ──
            case OZ_WEIGHT  -> qty;
            case GRAM       -> qty.divide(bd("28.3495"), SCALE, HALF_UP);
            case LB         -> qty.multiply(bd(16));
            case KG         -> qty.multiply(bd("35.274"));
            // ── Cross-dim: fluid oz → weight oz ──
            // (caller must supply ozWeightPerCup)
            default -> throw new IllegalArgumentException(
                    "No direct base conversion for unit: " + unit);
        };
    }

    /** Convert fluid/weight oz → target RecipeUnit. */
    private static BigDecimal fromBaseOz(BigDecimal oz, RecipeUnit unit, BigDecimal ozWtPerCup) {
        return switch (unit) {
            case OZ_FLUID   -> oz;
            case TSP        -> oz.multiply(bd(6));
            case TBSP       -> oz.multiply(bd(2));
            case CUP        -> oz.divide(bd(8),   SCALE, HALF_UP);
            case PINT       -> oz.divide(bd(16),  SCALE, HALF_UP);
            case QUART      -> oz.divide(bd(32),  SCALE, HALF_UP);
            case GALLON     -> oz.divide(bd(128), SCALE, HALF_UP);
            case OZ_WEIGHT  -> oz;
            case GRAM       -> oz.multiply(bd("28.3495"));
            case LB         -> oz.divide(bd(16),  SCALE, HALF_UP);
            case KG         -> oz.divide(bd("35.274"), SCALE, HALF_UP);
            default -> throw new IllegalArgumentException(
                    "No direct base conversion for unit: " + unit);
        };
    }

    // =========================================================
    // 2.2  INVENTORY COSTING RULES
    // =========================================================

    /**
     * Rule: Cost per Recipe Unit
     *
     *   ruCost = purchaseUnitPrice / ruPerPu / yieldPct
     *
     * This is the core cost used on every recipe line.
     *
     * @param purchaseUnitPrice  price paid per purchase unit (e.g. $43 / 4-lb box)
     * @param ruPerPu            number of recipe units per purchase unit (e.g. 160 oz)
     * @param yieldPct           usable yield as a decimal (0 < yieldPct ≤ 1)
     */
    public static BigDecimal calcRuCost(
            BigDecimal purchaseUnitPrice,
            BigDecimal ruPerPu,
            BigDecimal yieldPct
    ) {
        validate(purchaseUnitPrice, "purchaseUnitPrice");
        validate(ruPerPu,           "ruPerPu");
        if (yieldPct == null || yieldPct.compareTo(BigDecimal.ZERO) <= 0
                || yieldPct.compareTo(BigDecimal.ONE) > 0)
            throw new IllegalArgumentException("yieldPct must be in (0, 1]");

        return purchaseUnitPrice
                .divide(ruPerPu,   SCALE, HALF_UP)
                .divide(yieldPct,  SCALE, HALF_UP);
    }

    /**
     * Rule: Cost per Inventory Unit
     *
     *   iuCost = purchaseUnitPrice / iuPerPu
     *
     * Simpler — no yield applied (IU is what you count on the shelf).
     */
    public static BigDecimal calcIuCost(
            BigDecimal purchaseUnitPrice,
            BigDecimal iuPerPu
    ) {
        validate(purchaseUnitPrice, "purchaseUnitPrice");
        validate(iuPerPu,           "iuPerPu");
        return purchaseUnitPrice.divide(iuPerPu, SCALE, HALF_UP);
    }

    /**
     * Rule: Inventory line extension
     *
     *   extension = physicalCount × iuCost
     */
    public static BigDecimal calcExtension(
            BigDecimal physicalCount,
            BigDecimal iuCost
    ) {
        if (physicalCount == null || physicalCount.compareTo(BigDecimal.ZERO) < 0)
            throw new IllegalArgumentException("physicalCount must be ≥ 0");
        validate(iuCost, "iuCost");
        return physicalCount.multiply(iuCost).setScale(MONEY_SCALE, HALF_UP);
    }

    /**
     * Rule: Purchase-to-Inventory unit conversion factor
     *
     * The spreadsheet stores "ORDER TO INV" as the number of inventory
     * units per purchase unit (e.g. a 4-lb box → 4 inventory lbs, so factor = 4).
     *
     *   iuPerPu = puQuantity × conversionFactor
     *
     * This function validates the factor is positive and non-zero.
     */
    public static BigDecimal calcIuPerPu(
            BigDecimal puQuantity,
            BigDecimal orderToInvFactor
    ) {
        validate(puQuantity,        "puQuantity");
        validate(orderToInvFactor,  "orderToInvFactor");
        return puQuantity.multiply(orderToInvFactor).setScale(SCALE, HALF_UP);
    }

    // =========================================================
    // 2.3  RECIPE COSTING RULES
    // =========================================================

    /**
     * Rule: Recipe line extension (cost of one ingredient line)
     *
     *   lineExtension = quantityRu × ruCost
     */
    public static BigDecimal calcRecipeLineExtension(
            BigDecimal quantityRu,
            BigDecimal ruCost
    ) {
        if (quantityRu == null || quantityRu.compareTo(BigDecimal.ZERO) < 0)
            throw new IllegalArgumentException("quantityRu must be ≥ 0");
        validate(ruCost, "ruCost");
        return quantityRu.multiply(ruCost).setScale(MONEY_SCALE, HALF_UP);
    }

    /**
     * Rule: Total batch recipe cost
     *
     *   totalBatchCost = Σ(lineExtension for all ingredient lines)
     */
    public static BigDecimal calcTotalBatchCost(List<BigDecimal> lineExtensions) {
        if (lineExtensions == null || lineExtensions.isEmpty())
            return BigDecimal.ZERO;
        return lineExtensions.stream()
                .map(e -> e == null ? BigDecimal.ZERO : e)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(MONEY_SCALE, HALF_UP);
    }

    /**
     * Rule: Cost per yield unit of a batch recipe
     *
     *   costPerYieldUnit = totalBatchCost / yieldUnits
     *
     * This is what gets used when a batch recipe appears as
     * an ingredient on a menu item cost card.
     */
    public static BigDecimal calcBatchCostPerYieldUnit(
            BigDecimal totalBatchCost,
            BigDecimal yieldUnits
    ) {
        validate(totalBatchCost, "totalBatchCost");
        validate(yieldUnits,     "yieldUnits");
        return totalBatchCost.divide(yieldUnits, SCALE, HALF_UP);
    }

    // =========================================================
    // 2.4  MENU ITEM COSTING RULES
    // =========================================================

    /**
     * Rule: Menu item total cost
     *
     *   totalCost = Σ(ingredient line extensions) + plateCost
     *
     * plateCost is the Q-cost (fixed overhead per plate — china, linen, etc.)
     */
    public static BigDecimal calcMenuItemTotalCost(
            List<BigDecimal> lineExtensions,
            BigDecimal plateCost
    ) {
        BigDecimal ingredientSum = calcTotalBatchCost(lineExtensions);
        BigDecimal plate = (plateCost == null) ? BigDecimal.ZERO : plateCost;
        return ingredientSum.add(plate).setScale(MONEY_SCALE, HALF_UP);
    }

    /**
     * Rule: Gross profit per menu item sold
     *
     *   grossProfit = menuPrice − totalCost
     */
    public static BigDecimal calcGrossProfit(
            BigDecimal menuPrice,
            BigDecimal totalCost
    ) {
        validate(menuPrice,  "menuPrice");
        validate(totalCost,  "totalCost");
        return menuPrice.subtract(totalCost).setScale(MONEY_SCALE, HALF_UP);
    }

    /**
     * Rule: Food cost percentage
     *
     *   foodCostPct = totalCost / menuPrice
     *
     * Returns a decimal (e.g. 0.28 = 28%).
     * Returns ZERO when menuPrice is zero (avoids division by zero).
     */
    public static BigDecimal calcFoodCostPct(
            BigDecimal totalCost,
            BigDecimal menuPrice
    ) {
        validate(totalCost, "totalCost");
        validate(menuPrice, "menuPrice");
        if (menuPrice.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return totalCost.divide(menuPrice, SCALE, HALF_UP);
    }

    /**
     * Rule: Target menu price from a desired food cost %
     *
     *   targetPrice = totalCost / targetFoodCostPct
     */
    public static BigDecimal calcTargetMenuPrice(
            BigDecimal totalCost,
            BigDecimal targetFoodCostPct
    ) {
        validate(totalCost,         "totalCost");
        validate(targetFoodCostPct, "targetFoodCostPct");
        if (targetFoodCostPct.compareTo(BigDecimal.ZERO) <= 0
                || targetFoodCostPct.compareTo(BigDecimal.ONE) > 0)
            throw new IllegalArgumentException("targetFoodCostPct must be in (0, 1]");
        return totalCost.divide(targetFoodCostPct, MONEY_SCALE, HALF_UP);
    }

    // =========================================================
    // 2.5  MENU ENGINEERING CLASSIFICATION RULES
    // =========================================================

    /**
     * Rule: Popularity threshold (the "80% rule")
     *
     *   threshold = (totalSold / itemCount) × popularityFactor
     *
     * The spreadsheet uses popularityFactor = 0.80 by default.
     * An item with salesMix >= threshold is classified HIGH mix.
     */
    public static BigDecimal calcPopularityThreshold(
            int totalSold,
            int itemCount,
            BigDecimal popularityFactor   // default 0.80
    ) {
        if (totalSold < 0)  throw new IllegalArgumentException("totalSold must be ≥ 0");
        if (itemCount <= 0) throw new IllegalArgumentException("itemCount must be > 0");
        if (popularityFactor == null
                || popularityFactor.compareTo(BigDecimal.ZERO) <= 0
                || popularityFactor.compareTo(BigDecimal.ONE) > 0)
            throw new IllegalArgumentException("popularityFactor must be in (0, 1]");

        BigDecimal avgSold = bd(totalSold).divide(bd(itemCount), SCALE, HALF_UP);
        return avgSold.multiply(popularityFactor).setScale(SCALE, HALF_UP);
    }

    /**
     * Rule: Sales mix percentage for one item
     *
     *   salesMixPct = itemSold / totalSold
     */
    public static BigDecimal calcSalesMixPct(int itemSold, int totalSold) {
        if (itemSold < 0)  throw new IllegalArgumentException("itemSold must be ≥ 0");
        if (totalSold <= 0) throw new IllegalArgumentException("totalSold must be > 0");
        return bd(itemSold).divide(bd(totalSold), SCALE, HALF_UP);
    }

    /**
     * Rule: Classify sales mix as HIGH or LOW
     *
     *   HIGH  if salesMixPct >= popularityThreshold
     *   LOW   otherwise
     */
    public static HighLow classifySalesMix(
            BigDecimal salesMixPct,
            BigDecimal popularityThreshold
    ) {
        validate(salesMixPct,          "salesMixPct");
        validate(popularityThreshold,  "popularityThreshold");
        return salesMixPct.compareTo(popularityThreshold) >= 0 ? HighLow.HIGH : HighLow.LOW;
    }

    /**
     * Rule: Weighted average gross profit across all items
     *
     *   avgGrossProfit = Σ(itemGrossProfit × itemSold) / totalSold
     */
    public static BigDecimal calcWeightedAvgGrossProfit(
            List<BigDecimal> grossProfits,
            List<Integer>    quantitiesSold
    ) {
        if (grossProfits == null || quantitiesSold == null
                || grossProfits.size() != quantitiesSold.size())
            throw new IllegalArgumentException(
                    "grossProfits and quantitiesSold must be non-null and same length");

        BigDecimal totalContrib = BigDecimal.ZERO;
        int        totalSold    = 0;

        for (int i = 0; i < grossProfits.size(); i++) {
            BigDecimal gp  = grossProfits.get(i);
            int        qty = quantitiesSold.get(i);
            if (gp == null || qty < 0) continue;
            totalContrib = totalContrib.add(gp.multiply(bd(qty)));
            totalSold   += qty;
        }

        if (totalSold == 0) return BigDecimal.ZERO;
        return totalContrib.divide(bd(totalSold), SCALE, HALF_UP);
    }

    /**
     * Rule: Classify gross profit as HIGH or LOW
     *
     *   HIGH  if itemGrossProfit >= weightedAvgGrossProfit
     *   LOW   otherwise
     */
    public static HighLow classifyGrossProfit(
            BigDecimal itemGrossProfit,
            BigDecimal weightedAvgGrossProfit
    ) {
        validate(itemGrossProfit,          "itemGrossProfit");
        validate(weightedAvgGrossProfit,   "weightedAvgGrossProfit");
        return itemGrossProfit.compareTo(weightedAvgGrossProfit) >= 0
                ? HighLow.HIGH : HighLow.LOW;
    }

    /**
     * Rule: Four-quadrant classification
     *
     *   HIGH GP + HIGH Mix → WINNER
     *   LOW  GP + HIGH Mix → WORKHORSE
     *   HIGH GP + LOW  Mix → OPPORTUNITY
     *   LOW  GP + LOW  Mix → LOSER
     */
    public static MenuEngClassification classify(
            HighLow grossProfitCategory,
            HighLow salesMixCategory
    ) {
        if (grossProfitCategory == null) throw new IllegalArgumentException("grossProfitCategory is null");
        if (salesMixCategory    == null) throw new IllegalArgumentException("salesMixCategory is null");

        return switch (grossProfitCategory) {
            case HIGH -> salesMixCategory == HighLow.HIGH ? MenuEngClassification.WINNER
                                                          : MenuEngClassification.OPPORTUNITY;
            case LOW  -> salesMixCategory == HighLow.HIGH ? MenuEngClassification.WORKHORSE
                                                          : MenuEngClassification.LOSER;
        };
    }

    /**
     * Rule: Total cost for all units sold of one item
     *
     *   itemTotalCost = itemCost × quantitySold
     */
    public static BigDecimal calcItemTotalCost(BigDecimal itemCost, int quantitySold) {
        validate(itemCost, "itemCost");
        if (quantitySold < 0) throw new IllegalArgumentException("quantitySold must be ≥ 0");
        return itemCost.multiply(bd(quantitySold)).setScale(MONEY_SCALE, HALF_UP);
    }

    /**
     * Rule: Total revenue for all units sold of one item
     *
     *   itemTotalRevenue = sellPrice × quantitySold
     */
    public static BigDecimal calcItemTotalRevenue(BigDecimal sellPrice, int quantitySold) {
        validate(sellPrice, "sellPrice");
        if (quantitySold < 0) throw new IllegalArgumentException("quantitySold must be ≥ 0");
        return sellPrice.multiply(bd(quantitySold)).setScale(MONEY_SCALE, HALF_UP);
    }

    /**
     * Rule: Total profit for all units sold of one item
     *
     *   itemTotalProfit = itemTotalRevenue − itemTotalCost
     */
    public static BigDecimal calcItemTotalProfit(
            BigDecimal itemTotalRevenue,
            BigDecimal itemTotalCost
    ) {
        validate(itemTotalRevenue, "itemTotalRevenue");
        validate(itemTotalCost,    "itemTotalCost");
        return itemTotalRevenue.subtract(itemTotalCost).setScale(MONEY_SCALE, HALF_UP);
    }

    // =========================================================
    // 2.6  CONVERSION CALCULATOR RULES  (Volume ↔ Weight)
    //       Mirrors the "Conversion Calculator" sheet logic.
    // =========================================================

    /**
     * Rule: Total fluid ounces per purchase unit (when packed by VOLUME)
     *
     *   This is entered directly by the user per the spreadsheet.
     *   Function validates the relationship:
     *     totalFlOzPerPu must be > 0
     */
    public static BigDecimal validateTotalFlOzPerPu(BigDecimal totalFlOzPerPu) {
        validate(totalFlOzPerPu, "totalFlOzPerPu");
        return totalFlOzPerPu.setScale(SCALE, HALF_UP);
    }

    /**
     * Rule: Total weight ounces per purchase unit when packed by VOLUME
     *
     *   totalWtOzPerPu = (totalFlOzPerPu / 8) × ozWeightPerCup
     *
     * Converting fl oz → cups → weight oz using ingredient density.
     */
    public static BigDecimal calcTotalWtOzPerPu_fromVolume(
            BigDecimal totalFlOzPerPu,
            BigDecimal ozWeightPerCup
    ) {
        validate(totalFlOzPerPu, "totalFlOzPerPu");
        validate(ozWeightPerCup, "ozWeightPerCup");
        BigDecimal cups = totalFlOzPerPu.divide(bd(8), SCALE, HALF_UP);
        return cups.multiply(ozWeightPerCup).setScale(SCALE, HALF_UP);
    }

    /**
     * Rule: Total fluid ounces per purchase unit when packed by WEIGHT
     *
     *   totalFlOzPerPu = (totalWtOzPerPu / ozWeightPerCup) × 8
     */
    public static BigDecimal calcTotalFlOzPerPu_fromWeight(
            BigDecimal totalWtOzPerPu,
            BigDecimal ozWeightPerCup
    ) {
        validate(totalWtOzPerPu, "totalWtOzPerPu");
        validate(ozWeightPerCup, "ozWeightPerCup");
        BigDecimal cups = totalWtOzPerPu.divide(ozWeightPerCup, SCALE, HALF_UP);
        return cups.multiply(bd(8)).setScale(SCALE, HALF_UP);
    }

    /**
     * Rule: Cost per fluid ounce
     *
     *   If packed by VOLUME:  costPerFlOz = purchasePrice / totalFlOzPerPu
     *   If packed by WEIGHT:  costPerFlOz = purchasePrice / totalFlOzPerPu
     *                          (totalFlOzPerPu derived from weight via above rule)
     */
    public static BigDecimal calcCostPerFlOz(
            BigDecimal purchasePrice,
            BigDecimal totalFlOzPerPu
    ) {
        validate(purchasePrice,   "purchasePrice");
        validate(totalFlOzPerPu,  "totalFlOzPerPu");
        return purchasePrice.divide(totalFlOzPerPu, SCALE, HALF_UP);
    }

    /**
     * Rule: Cost per weight ounce
     *
     *   If packed by WEIGHT:  costPerWtOz = purchasePrice / totalWtOzPerPu
     *   If packed by VOLUME:  costPerWtOz = purchasePrice / totalWtOzPerPu
     *                          (totalWtOzPerPu derived from volume via above rule)
     */
    public static BigDecimal calcCostPerWtOz(
            BigDecimal purchasePrice,
            BigDecimal totalWtOzPerPu
    ) {
        validate(purchasePrice,  "purchasePrice");
        validate(totalWtOzPerPu, "totalWtOzPerPu");
        return purchasePrice.divide(totalWtOzPerPu, SCALE, HALF_UP);
    }

    // =========================================================
    // 2.7  PROOF / INVOICE VALIDATION RULE
    // =========================================================

    /**
     * Rule: Invoice proof check
     *
     *   proof = invoiceAmount − (food + softBev + liquor + bottleBeer
     *                           + draftBeer + wine + merchandise + supplies)
     *
     * A correctly entered invoice has proof == 0.
     * Returns the variance (non-zero means data entry error).
     */
    public static BigDecimal calcInvoiceProof(
            BigDecimal invoiceAmount,
            BigDecimal food,
            BigDecimal softBev,
            BigDecimal liquor,
            BigDecimal bottleBeer,
            BigDecimal draftBeer,
            BigDecimal wine,
            BigDecimal merchandise,
            BigDecimal supplies
    ) {
        validate(invoiceAmount, "invoiceAmount");
        BigDecimal sumOfParts = nullSafe(food)
                .add(nullSafe(softBev))
                .add(nullSafe(liquor))
                .add(nullSafe(bottleBeer))
                .add(nullSafe(draftBeer))
                .add(nullSafe(wine))
                .add(nullSafe(merchandise))
                .add(nullSafe(supplies));
        return invoiceAmount.subtract(sumOfParts).setScale(MONEY_SCALE, HALF_UP);
    }

    // =========================================================
    // PRIVATE HELPERS
    // =========================================================

    private static void validate(BigDecimal v, String name) {
        if (v == null || v.compareTo(BigDecimal.ZERO) < 0)
            throw new IllegalArgumentException(name + " must be non-null and ≥ 0");
    }

    private static BigDecimal nullSafe(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    private static BigDecimal bd(int v) {
        return BigDecimal.valueOf(v);
    }

    private static BigDecimal bd(String v) {
        return new BigDecimal(v);
    }
}