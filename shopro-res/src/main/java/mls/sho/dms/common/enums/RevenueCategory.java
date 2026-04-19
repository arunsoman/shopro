package mls.sho.dms.common.enums;

/**
 * Revenue category for POS sales-mix breakdown.
 * Maps MenuCostGroup to the POS revenue bucket it contributes to.
 *
 * Used by PrimeCostService to derive food/soft-bev/liquor/beer/wine/merch
 * sales splits from live OrderLine data — replacing hardcoded percentages.
 */
public enum RevenueCategory {
    FOOD,      // Mains, starters, desserts, kids meals
    SOFT_BEV,  // Soft drinks, juices, coffee, tea
    LIQUOR,    // Spirits, cocktails, shots
    BEER,      // Bottle and draft beer combined
    WINE,      // Wine by the glass and bottle
    MERCH      // Merchandise, gift cards, other non-food
}
