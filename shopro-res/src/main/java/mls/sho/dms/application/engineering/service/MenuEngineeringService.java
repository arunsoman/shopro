package mls.sho.dms.application.engineering.service;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.costing.service.MenuItemCostService;
import mls.sho.dms.common.enums.HighLow;
import mls.sho.dms.common.enums.MenuEngClassification;
import mls.sho.dms.common.util.ConversionFunctions;
import mls.sho.dms.entity.MenuItem;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuEngineeringService {

    private final MenuItemCostService menuItemCostService;

    @Data
    @Builder
    public static class MenuEngResult {
        private String itemName;
        private int quantitySold;
        private BigDecimal itemCost;
        private BigDecimal sellPrice;
        private BigDecimal grossProfit;
        private BigDecimal salesMixPct;
        private MenuEngClassification classification;
    }

    public List<MenuEngResult> runAnalysis(List<MenuItem> items, List<Integer> quantitiesSold) {
        if (items.size() != quantitiesSold.size()) throw new IllegalArgumentException();

        int totalSold = quantitiesSold.stream().mapToInt(Integer::intValue).sum();
        int itemCount = items.size();
        BigDecimal popularityThreshold = ConversionFunctions.calcPopularityThreshold(
                totalSold, itemCount, new BigDecimal("0.7")); // 70% threshold

        List<BigDecimal> gps = items.stream()
                .map(item -> {
                    BigDecimal cost = menuItemCostService.calculateMenuItemTotalCost(item);
                    return ConversionFunctions.calcGrossProfit(item.getSellPriceBuffer(), cost);
                })
                .collect(Collectors.toList());

        BigDecimal weightedAvgGp = ConversionFunctions.calcWeightedAvgGrossProfit(gps, quantitiesSold);

        return items.stream().map(item -> {
            int idx = items.indexOf(item);
            int sold = quantitiesSold.get(idx);
            BigDecimal cost = menuItemCostService.calculateMenuItemTotalCost(item);
            BigDecimal gp = gps.get(idx);

            BigDecimal salesMix = ConversionFunctions.calcSalesMixPct(sold, totalSold);
            HighLow mixCat = ConversionFunctions.classifySalesMix(salesMix, popularityThreshold);
            HighLow gpCat = ConversionFunctions.classifyGrossProfit(gp, weightedAvgGp);

            return MenuEngResult.builder()
                    .itemName(item.getName())
                    .quantitySold(sold)
                    .itemCost(cost)
                    .sellPrice(item.getSellPriceBuffer())
                    .grossProfit(gp)
                    .salesMixPct(salesMix)
                    .classification(ConversionFunctions.classify(gpCat, mixCat))
                    .build();
        }).collect(Collectors.toList());
    }
}
