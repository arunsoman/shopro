package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.service.BidService;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/operator/bidding")
@RequiredArgsConstructor
public class OperatorBiddingController {

    private final BidService bidService;

    @GetMapping("/active")
    public List<Map<String, Object>> getActiveBids() {
        return bidService.getInvitations().stream()
                .map(bi -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", bi.getId().toString());
                    map.put("title", bi.getTitle());
                    map.put("category", bi.getCategory() != null ? bi.getCategory().getName() : "UNSPECIFIED");
                    map.put("status", bi.getStatus().name());
                    map.put("endsAt", bi.getDeadline().toString());
                    map.put("responses", bidService.getQuotesForInvitation(bi.getId()).size());
                    map.put("targetPrice", 0); // Not in entity yet
                    return map;
                }).toList();
    }

    @GetMapping("/evaluations/{bidId}")
    public List<Map<String, Object>> getBidEvaluations(@PathVariable String bidId) {
        return bidService.getQuotesForInvitation(UUID.fromString(bidId)).stream()
                .map(q -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", q.getId().toString());
                    map.put("supplier", q.getSupplier().getName());
                    map.put("price", q.getTotalAmount().doubleValue());
                    map.put("deliveryTime", "N/A");
                    map.put("score", 100); 
                    map.put("status", q.getStatus().name());
                    return map;
                }).toList();
    }

    @GetMapping("/forecast")
    public Map<String, Object> getDemandForecast() {
        return Map.of(
            "summary", Map.of(
                "period", "Next 30 Days",
                "confidence", 94,
                "totalProjected", 2450000
            ),
            "categories", List.of(
                Map.of("name", "Produce", "forecast", "+12%", "risk", "Low"),
                Map.of("name", "Dairy", "forecast", "-2%", "risk", "Medium"),
                Map.of("name", "Meat", "forecast", "+5%", "risk", "Low"),
                Map.of("name", "Dry Goods", "forecast", "+18%", "risk", "High")
            ),
            "insights", List.of(
                "Expected spike in avocado demand due to IPL season start.",
                "Milk prices projected to rise 4% next month - consider locking in bids.",
                "Vegetable supply flux expected from North nodes - alternate routes suggested."
            )
        );
    }
}
