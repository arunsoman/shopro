package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.mplace.entity.Food;
import mls.sho.mplace.entity.SupplyList;
import mls.sho.mplace.repository.FoodRepository;
import mls.sho.mplace.repository.SupplyListRepository;
import mls.sho.mplace.repository.MarkupRuleRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * 100% Dynamic Pricing Engine
 * Calculates real-time quotes based on supplier costs and markup rules.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PricingService {

    private final SupplyListRepository supplyListRepository;
    private final FoodRepository foodRepository;
    private final MarkupRuleRepository markupRuleRepository;

    public record DynamicPriceQuote(
            BigDecimal basePrice,
            BigDecimal finalPrice,
            BigDecimal markupAmount,
            boolean fromWapp
    ) {}

    public DynamicPriceQuote getDynamicQuote(Integer foodId, BigDecimal quantity) {
        Food food = foodRepository.findById(foodId)
                .orElseThrow(() -> new RuntimeException("Food not found: " + foodId));

        // Find available offers with stock
        List<SupplyList> offers = supplyListRepository.findAllByFoodIdAndIsAvailableTrueAndStockQtyGreaterThanOrderByPriceAsc(foodId, 0.0);
        
        if (offers.isEmpty()) {
            return new DynamicPriceQuote(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, false);
        }

        BigDecimal basePrice;
        boolean isWapp = false;

        // If quantity is significant (>1), use WAPP logic
        if (quantity != null && quantity.compareTo(BigDecimal.ONE) > 0) {
            basePrice = calculateBatchWapp(foodId, quantity, offers);
            isWapp = true;
        } else {
            // Otherwise, use the cheapest available price
            basePrice = offers.get(0).getPrice();
        }

        BigDecimal markupFactor = resolveMarkupFactor(food);
        BigDecimal finalPrice = calculateFinalPrice(basePrice, markupFactor);
        BigDecimal markupAmount = (finalPrice != null && basePrice != null) ? finalPrice.subtract(basePrice) : BigDecimal.ZERO;

        return new DynamicPriceQuote(basePrice, finalPrice, markupAmount, isWapp);
    }

    private BigDecimal resolveMarkupFactor(Food food) {
        return markupRuleRepository.findApplicableRules(
            food.getId().toString(), 
            food.getFoodGroup(), 
            food.getFoodSubgroup()
        ).stream().findFirst().map(rule -> {
            // Logic: 0.x = Percentage, > 1.0 = Flat
            return rule.getMarkupValue(); 
        }).orElse(BigDecimal.ZERO);
    }

    private BigDecimal calculateBatchWapp(Integer foodId, BigDecimal totalNeeded, List<SupplyList> available) {
        BigDecimal remaining = totalNeeded;
        BigDecimal totalCost = BigDecimal.ZERO;
        BigDecimal fulfilled = BigDecimal.ZERO;

        for (SupplyList supply : available) {
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;
            BigDecimal availableQty = BigDecimal.valueOf(supply.getStockQty());
            BigDecimal take = remaining.min(availableQty);
            
            totalCost = totalCost.add(supply.getPrice().multiply(take));
            remaining = remaining.subtract(take);
            fulfilled = fulfilled.add(take);
        }

        return fulfilled.compareTo(BigDecimal.ZERO) > 0 
            ? totalCost.divide(fulfilled, 4, RoundingMode.HALF_UP) 
            : available.get(0).getPrice(); 
    }

    private BigDecimal calculateFinalPrice(BigDecimal basePrice, BigDecimal markup) {
        if (basePrice == null) return null;
        if (markup == null || markup.compareTo(BigDecimal.ZERO) <= 0) return basePrice;

        // markup > 1.0 -> Flat addition
        // 0.x -> Percentage (e.g. 0.15 = 15%)
        if (markup.compareTo(BigDecimal.ONE) >= 0) {
            return basePrice.add(markup);
        } else {
            return basePrice.multiply(BigDecimal.ONE.add(markup));
        }
    }
}
