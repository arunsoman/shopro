package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.Food;
import mls.sho.mplace.repository.FoodRepository;
import mls.sho.mplace.service.PricingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prices")
@RequiredArgsConstructor
public class PriceController {

    private final PricingService pricingService;
    private final FoodRepository foodRepository;

    public record PriceResponse(
            Integer foodId,
            String foodName,
            BigDecimal currentPrice,
            LocalDateTime effectiveFrom,
            boolean priceNotFound
    ) {}

    @GetMapping("/{foodId}")
    public ResponseEntity<PriceResponse> getPrice(@PathVariable Integer foodId, @RequestParam(required = false) BigDecimal quantity) {
        PricingService.DynamicPriceQuote quote = pricingService.getDynamicQuote(foodId, quantity);
        
        if (quote.finalPrice().compareTo(BigDecimal.ZERO) == 0) {
            return ResponseEntity.notFound().build();
        }

        Food food = foodRepository.findById(foodId).orElse(null);
        return ResponseEntity.ok(new PriceResponse(
                foodId,
                food != null ? food.getName() : "Unknown",
                quote.finalPrice(),
                LocalDateTime.now(),
                false
        ));
    }

    @PostMapping("/bulk")
    public List<PriceResponse> getPricesBulk(@RequestBody Map<String, Object> request) {
        List<Map<String, Object>> items = (List<Map<String, Object>>) request.get("items");
        List<PriceResponse> responses = new ArrayList<>();

        if (items != null) {
            for (Map<String, Object> item : items) {
                Integer id = (Integer) item.get("foodId");
                BigDecimal qty = item.containsKey("quantity") ? new BigDecimal(item.get("quantity").toString()) : BigDecimal.ONE;
                
                PricingService.DynamicPriceQuote quote = pricingService.getDynamicQuote(id, qty);
                Food food = foodRepository.findById(id).orElse(null);
                
                if (quote.finalPrice().compareTo(BigDecimal.ZERO) > 0) {
                    responses.add(new PriceResponse(id, food != null ? food.getName() : "Unknown", quote.finalPrice(), LocalDateTime.now(), false));
                } else {
                    responses.add(new PriceResponse(id, food != null ? food.getName() : "Unknown", null, null, true));
                }
            }
        }
        return responses;
    }
}
