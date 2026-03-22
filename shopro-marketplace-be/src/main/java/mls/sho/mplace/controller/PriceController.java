package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.Food;
import mls.sho.mplace.entity.PricePoint;
import mls.sho.mplace.repository.FoodRepository;
import mls.sho.mplace.repository.PricePointRepository;
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

    private final PricePointRepository pricePointRepository;
    private final FoodRepository foodRepository;

    public record PriceResponse(
            Integer foodId,
            String foodName,
            BigDecimal currentPrice,
            LocalDateTime effectiveFrom,
            boolean priceNotFound
    ) {}

    @GetMapping("/{foodId}")
    public ResponseEntity<PriceResponse> getPrice(@PathVariable Integer foodId) {
        return pricePointRepository.findTopByFoodIdOrderByEffectiveFromDesc(foodId)
                .map(pp -> {
                    Food food = foodRepository.findById(foodId).orElse(null);
                    return ResponseEntity.ok(new PriceResponse(
                            foodId,
                            food != null ? food.getName() : "Unknown",
                            pp.getPrice(),
                            pp.getEffectiveFrom(),
                            false
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/bulk")
    public List<PriceResponse> getPricesBulk(@RequestBody Map<String, List<Integer>> request) {
        List<Integer> foodIds = request.get("foodIds");
        List<PriceResponse> responses = new ArrayList<>();

        if (foodIds != null) {
            for (Integer id : foodIds) {
                var priceOpt = pricePointRepository.findTopByFoodIdOrderByEffectiveFromDesc(id);
                Food food = foodRepository.findById(id).orElse(null);
                
                if (priceOpt.isPresent()) {
                    PricePoint pp = priceOpt.get();
                    responses.add(new PriceResponse(id, food != null ? food.getName() : "Unknown", pp.getPrice(), pp.getEffectiveFrom(), false));
                } else {
                    responses.add(new PriceResponse(id, food != null ? food.getName() : "Unknown", null, null, true));
                }
            }
        }
        return responses;
    }
}
