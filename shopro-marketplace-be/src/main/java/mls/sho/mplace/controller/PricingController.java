package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.service.PricingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/pricing")
@RequiredArgsConstructor
public class PricingController {

    private final PricingService pricingService;

    /**
     * @deprecated Dynamic pricing doesn't require manual reload. 
     * Kept for API compatibility but performs no-op.
     */
    @PostMapping("/reload")
    @Deprecated
    public ResponseEntity<Map<String, Object>> reloadPricePoints(@RequestParam(required = false) BigDecimal markup) {
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Dynamic pricing is active. Manual reload is no longer required."
        ));
    }

    @GetMapping("/quote/{foodId}")
    public ResponseEntity<PricingService.DynamicPriceQuote> getQuote(
            @PathVariable Integer foodId, 
            @RequestParam(defaultValue = "1") BigDecimal quantity) {
        return ResponseEntity.ok(pricingService.getDynamicQuote(foodId, quantity));
    }
}
