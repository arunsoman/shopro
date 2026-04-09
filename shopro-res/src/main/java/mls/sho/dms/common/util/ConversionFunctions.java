package mls.sho.dms.common.util;

import mls.sho.dms.common.enums.HighLow;
import mls.sho.dms.common.enums.MenuEngClassification;
import mls.sho.dms.common.enums.RecipeUnit;

import java.math.BigDecimal;
import java.math.MathContext;
import java.util.List;

import static java.math.RoundingMode.HALF_UP;

/**
 * Pure conversion functions for restaurant calculations.
 * Stateless, side-effect free, and thread-safe.
 */
public final class ConversionFunctions {

    private static final int SCALE = 6;
    private static final int MONEY_SCALE = 2;
    private static final MathContext MC = new MathContext(10, HALF_UP);

    private ConversionFunctions() {
    }

    private static BigDecimal bd(long val) {
        return BigDecimal.valueOf(val);
    }

    private static BigDecimal bd(String val) {
        return new BigDecimal(val);
    }

    private static void validate(BigDecimal value, String name) {
        if (value == null || value.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(name + " must be non-null and ≥ 0");
        }
    }

    private static BigDecimal nullSafe(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    // =========================================================
    // 2.1  UNIT CONVERSIONS  (RecipeUnit ↔ RecipeUnit)
    // =========================================================

    public static BigDecimal convertRecipeUnit(
            BigDecimal quantity,
            RecipeUnit from,
            RecipeUnit to,
            BigDecimal ozWeightPerCup
    ) {
        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) < 0)
            throw new IllegalArgumentException("quantity must be ≥ 0");
        if (from == to) return quantity.setScale(SCALE, HALF_UP);

        BigDecimal inOz = toBaseOz(quantity, from, ozWeightPerCup);
        return fromBaseOz(inOz, to, ozWeightPerCup);
    }

    private static BigDecimal toBaseOz(BigDecimal qty, RecipeUnit unit, BigDecimal ozWtPerCup) {
        return switch (unit) {
            case OZ_FLUID -> qty;
            case TSP -> qty.divide(bd(6), SCALE, HALF_UP);
            case TBSP -> qty.divide(bd(2), SCALE, HALF_UP);
            case CUP -> qty.multiply(bd(8));
            case PINT -> qty.multiply(bd(16));
            case QUART -> qty.multiply(bd(32));
            case GALLON -> qty.multiply(bd(128));
            case OZ_WEIGHT -> qty;
            case GRAM -> qty.divide(bd("28.3495"), SCALE, HALF_UP);
            case LB -> qty.multiply(bd(16));
            case KG -> qty.multiply(bd("35.274"));
            default -> throw new IllegalArgumentException("No direct base conversion for unit: " + unit);
        };
    }

    private static BigDecimal fromBaseOz(BigDecimal oz, RecipeUnit unit, BigDecimal ozWtPerCup) {
        return switch (unit) {
            case OZ_FLUID -> oz;
            case TSP -> oz.multiply(bd(6));
            case TBSP -> oz.multiply(bd(2));
            case CUP -> oz.divide(bd(8), SCALE, HALF_UP);
            case PINT -> oz.divide(bd(16), SCALE, HALF_UP);
            case QUART -> oz.divide(bd(32), SCALE, HALF_UP);
            case GALLON -> oz.divide(bd(128), SCALE, HALF_UP);
            case OZ_WEIGHT -> oz;
            case GRAM -> oz.multiply(bd("28.3495"));
            case LB -> oz.divide(bd(16), SCALE, HALF_UP);
            case KG -> oz.divide(bd("35.274"), SCALE, HALF_UP);
            default -> throw new IllegalArgumentException("No direct base conversion for unit: " + unit);
        };
    }

    // =========================================================
    // 2.2  INVENTORY COSTING RULES
    // =========================================================

    public static BigDecimal calcRuCost(
            BigDecimal purchaseUnitPrice,
            BigDecimal ruPerPu,
            BigDecimal yieldPct
    ) {
        validate(purchaseUnitPrice, "purchaseUnitPrice");
        validate(ruPerPu, "ruPerPu");
        if (yieldPct == null || yieldPct.compareTo(BigDecimal.ZERO) <= 0
                || yieldPct.compareTo(BigDecimal.ONE) > 0)
            throw new IllegalArgumentException("yieldPct must be in (0, 1]");

        return purchaseUnitPrice
                .divide(ruPerPu, SCALE, HALF_UP)
                .divide(yieldPct, SCALE, HALF_UP);
    }

    public static BigDecimal calcIuCost(
            BigDecimal purchaseUnitPrice,
            BigDecimal iuPerPu
    ) {
        validate(purchaseUnitPrice, "purchaseUnitPrice");
        validate(iuPerPu, "iuPerPu");
        return purchaseUnitPrice.divide(iuPerPu, SCALE, HALF_UP);
    }

    public static BigDecimal calcExtension(
            BigDecimal physicalCount,
            BigDecimal iuCost
    ) {
        if (physicalCount == null || physicalCount.compareTo(BigDecimal.ZERO) < 0)
            throw new IllegalArgumentException("physicalCount must be ≥ 0");
        validate(iuCost, "iuCost");
        return physicalCount.multiply(iuCost).setScale(MONEY_SCALE, HALF_UP);
    }

    public static BigDecimal calcIuPerPu(
            BigDecimal puQuantity,
            BigDecimal orderToInvFactor
    ) {
        validate(puQuantity, "puQuantity");
        validate(orderToInvFactor, "orderToInvFactor");
        return puQuantity.multiply(orderToInvFactor).setScale(SCALE, HALF_UP);
    }

    // =========================================================
    // 2.3  RECIPE COSTING RULES
    // =========================================================

    public static BigDecimal calcRecipeLineExtension(
            BigDecimal quantityRu,
            BigDecimal ruCost
    ) {
        if (quantityRu == null || quantityRu.compareTo(BigDecimal.ZERO) < 0)
            throw new IllegalArgumentException("quantityRu must be ≥ 0");
        validate(ruCost, "ruCost");
        return quantityRu.multiply(ruCost).setScale(MONEY_SCALE, HALF_UP);
    }

    public static BigDecimal calcTotalBatchCost(List<BigDecimal> lineExtensions) {
        if (lineExtensions == null || lineExtensions.isEmpty())
            return BigDecimal.ZERO;
        return lineExtensions.stream()
                .map(e -> e == null ? BigDecimal.ZERO : e)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(MONEY_SCALE, HALF_UP);
    }

    public static BigDecimal calcBatchCostPerYieldUnit(
            BigDecimal totalBatchCost,
            BigDecimal yieldUnits
    ) {
        validate(totalBatchCost, "totalBatchCost");
        validate(yieldUnits, "yieldUnits");
        if (yieldUnits.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return totalBatchCost.divide(yieldUnits, SCALE, HALF_UP);
    }

    // =========================================================
    // 2.4  MENU ITEM COSTING RULES
    // =========================================================

    public static BigDecimal calcMenuItemTotalCost(
            List<BigDecimal> lineExtensions,
            BigDecimal plateCost
    ) {
        BigDecimal ingredientSum = calcTotalBatchCost(lineExtensions);
        BigDecimal plate = (plateCost == null) ? BigDecimal.ZERO : plateCost;
        return ingredientSum.add(plate).setScale(MONEY_SCALE, HALF_UP);
    }

    public static BigDecimal calcGrossProfit(
            BigDecimal menuPrice,
            BigDecimal totalCost
    ) {
        validate(menuPrice, "menuPrice");
        validate(totalCost, "totalCost");
        return menuPrice.subtract(totalCost).setScale(MONEY_SCALE, HALF_UP);
    }

    public static BigDecimal calcFoodCostPct(
            BigDecimal totalCost,
            BigDecimal menuPrice
    ) {
        validate(totalCost, "totalCost");
        validate(menuPrice, "menuPrice");
        if (menuPrice.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return totalCost.divide(menuPrice, SCALE, HALF_UP);
    }

    public static BigDecimal calcTargetMenuPrice(
            BigDecimal totalCost,
            BigDecimal targetFoodCostPct
    ) {
        validate(totalCost, "totalCost");
        validate(targetFoodCostPct, "targetFoodCostPct");
        if (targetFoodCostPct.compareTo(BigDecimal.ZERO) <= 0
                || targetFoodCostPct.compareTo(BigDecimal.ONE) > 0)
            throw new IllegalArgumentException("targetFoodCostPct must be in (0, 1]");
        return totalCost.divide(targetFoodCostPct, MONEY_SCALE, HALF_UP);
    }

    // =========================================================
    // 2.5  MENU ENGINEERING CLASSIFICATION RULES
    // =========================================================

    public static BigDecimal calcPopularityThreshold(
            int totalSold,
            int itemCount,
            BigDecimal popularityFactor
    ) {
        if (totalSold < 0) throw new IllegalArgumentException("totalSold must be ≥ 0");
        if (itemCount <= 0) throw new IllegalArgumentException("itemCount must be > 0");
        if (popularityFactor == null
                || popularityFactor.compareTo(BigDecimal.ZERO) <= 0
                || popularityFactor.compareTo(BigDecimal.ONE) > 0)
            throw new IllegalArgumentException("popularityFactor must be in (0, 1]");

        BigDecimal avgSold = bd(totalSold).divide(bd(itemCount), SCALE, HALF_UP);
        return avgSold.multiply(popularityFactor).setScale(SCALE, HALF_UP);
    }

    public static BigDecimal calcSalesMixPct(int itemSold, int totalSold) {
        if (itemSold < 0) throw new IllegalArgumentException("itemSold must be ≥ 0");
        if (totalSold <= 0) throw new IllegalArgumentException("totalSold must be > 0");
        return bd(itemSold).divide(bd(totalSold), SCALE, HALF_UP);
    }

    public static HighLow classifySalesMix(
            BigDecimal salesMixPct,
            BigDecimal popularityThreshold
    ) {
        validate(salesMixPct, "salesMixPct");
        validate(popularityThreshold, "popularityThreshold");
        return salesMixPct.compareTo(popularityThreshold) >= 0 ? HighLow.HIGH : HighLow.LOW;
    }

    public static BigDecimal calcWeightedAvgGrossProfit(
            List<BigDecimal> grossProfits,
            List<Integer> quantitiesSold
    ) {
        if (grossProfits == null || quantitiesSold == null
                || grossProfits.size() != quantitiesSold.size())
            throw new IllegalArgumentException(
                    "grossProfits and quantitiesSold must be non-null and same length");

        BigDecimal totalContrib = BigDecimal.ZERO;
        int totalSold = 0;

        for (int i = 0; i < grossProfits.size(); i++) {
            BigDecimal gp = grossProfits.get(i);
            int qty = quantitiesSold.get(i);
            if (gp == null || qty < 0) continue;
            totalContrib = totalContrib.add(gp.multiply(bd(qty)));
            totalSold += qty;
        }

        if (totalSold == 0) return BigDecimal.ZERO;
        return totalContrib.divide(bd(totalSold), SCALE, HALF_UP);
    }

    public static HighLow classifyGrossProfit(
            BigDecimal itemGrossProfit,
            BigDecimal weightedAvgGrossProfit
    ) {
        validate(itemGrossProfit, "itemGrossProfit");
        validate(weightedAvgGrossProfit, "weightedAvgGrossProfit");
        return itemGrossProfit.compareTo(weightedAvgGrossProfit) >= 0
                ? HighLow.HIGH : HighLow.LOW;
    }

    public static MenuEngClassification classify(
            HighLow grossProfitCategory,
            HighLow salesMixCategory
    ) {
        if (grossProfitCategory == null) throw new IllegalArgumentException("grossProfitCategory is null");
        if (salesMixCategory == null) throw new IllegalArgumentException("salesMixCategory is null");

        return switch (grossProfitCategory) {
            case HIGH -> salesMixCategory == HighLow.HIGH ? MenuEngClassification.WINNER
                    : MenuEngClassification.OPPORTUNITY;
            case LOW -> salesMixCategory == HighLow.HIGH ? MenuEngClassification.WORKHORSE
                    : MenuEngClassification.LOSER;
        };
    }

    public static BigDecimal calcItemTotalCost(BigDecimal itemCost, int quantitySold) {
        validate(itemCost, "itemCost");
        if (quantitySold < 0) throw new IllegalArgumentException("quantitySold must be ≥ 0");
        return itemCost.multiply(bd(quantitySold)).setScale(MONEY_SCALE, HALF_UP);
    }

    public static BigDecimal calcItemTotalRevenue(BigDecimal sellPrice, int quantitySold) {
        validate(sellPrice, "sellPrice");
        if (quantitySold < 0) throw new IllegalArgumentException("quantitySold must be ≥ 0");
        return sellPrice.multiply(bd(quantitySold)).setScale(MONEY_SCALE, HALF_UP);
    }

    public static BigDecimal calcItemTotalProfit(
            BigDecimal itemTotalRevenue,
            BigDecimal itemTotalCost
    ) {
        validate(itemTotalRevenue, "itemTotalRevenue");
        validate(itemTotalCost, "itemTotalCost");
        return itemTotalRevenue.subtract(itemTotalCost).setScale(MONEY_SCALE, HALF_UP);
    }

    // =========================================================
    // 2.6  CONVERSION CALCULATOR RULES
    // =========================================================

    public static BigDecimal validateTotalFlOzPerPu(BigDecimal totalFlOzPerPu) {
        validate(totalFlOzPerPu, "totalFlOzPerPu");
        return totalFlOzPerPu.setScale(SCALE, HALF_UP);
    }

    public static BigDecimal calcTotalWtOzPerPu_fromVolume(
            BigDecimal totalFlOzPerPu,
            BigDecimal ozWeightPerCup
    ) {
        validate(totalFlOzPerPu, "totalFlOzPerPu");
        validate(ozWeightPerCup, "ozWeightPerCup");
        BigDecimal cups = totalFlOzPerPu.divide(bd(8), SCALE, HALF_UP);
        return cups.multiply(ozWeightPerCup).setScale(SCALE, HALF_UP);
    }

    public static BigDecimal calcTotalFlOzPerPu_fromWeight(
            BigDecimal totalWtOzPerPu,
            BigDecimal ozWeightPerCup
    ) {
        validate(totalWtOzPerPu, "totalWtOzPerPu");
        validate(ozWeightPerCup, "ozWeightPerCup");
        if (ozWeightPerCup.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        BigDecimal cups = totalWtOzPerPu.divide(ozWeightPerCup, SCALE, HALF_UP);
        return cups.multiply(bd(8)).setScale(SCALE, HALF_UP);
    }

    public static BigDecimal calcCostPerFlOz(
            BigDecimal purchasePrice,
            BigDecimal totalFlOzPerPu
    ) {
        validate(purchasePrice, "purchasePrice");
        validate(totalFlOzPerPu, "totalFlOzPerPu");
        if (totalFlOzPerPu.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return purchasePrice.divide(totalFlOzPerPu, SCALE, HALF_UP);
    }

    public static BigDecimal calcCostPerWtOz(
            BigDecimal purchasePrice,
            BigDecimal totalWtOzPerPu
    ) {
        validate(purchasePrice, "purchasePrice");
        validate(totalWtOzPerPu, "totalWtOzPerPu");
        if (totalWtOzPerPu.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return purchasePrice.divide(totalWtOzPerPu, SCALE, HALF_UP);
    }

    // =========================================================
    // 2.7  PROOF / INVOICE VALIDATION RULE
    // =========================================================

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
}
