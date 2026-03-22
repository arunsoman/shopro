package mls.sho.mplace.controller;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * Buyer (Restaurant) Fulfillment Controller
 * Scoped to /api/buyer/**
 */
@RestController
@RequestMapping("/api/buyer/fulfillment")
@RequiredArgsConstructor
public class BuyerFulfillmentController {

    private final mls.sho.mplace.service.OrderService orderService;

    @PostMapping("/{poId}/amend")
    public Map<String, String> requestAmendment(@PathVariable String poId, @RequestBody Map<String, Object> details) {
        return Map.of("id", poId, "status", "AMENDMENT_REQUESTED");
    }

    @PostMapping("/{poId}/confirm")
    public Map<String, String> confirmDelivery(@PathVariable String poId, @RequestBody Map<String, Object> details) {
        return Map.of("id", poId, "status", "DELIVERY_CONFIRMED");
    }
}
