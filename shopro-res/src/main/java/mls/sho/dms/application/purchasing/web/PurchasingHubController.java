package mls.sho.dms.application.purchasing.web;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.purchasing.dto.PurchasingHubCountsDTO;
import mls.sho.dms.application.purchasing.service.PurchasingDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for Purchasing Hub navigation and dashboard functionality.
 * Provides aggregated counts for navigation cards and hub-level metrics.
 */
@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/purchasing-hub")
@RequiredArgsConstructor
public class PurchasingHubController {

    private final PurchasingDashboardService dashboardService;

    /**
     * Get all navigation card counts for the Purchasing Hub.
     * Returns counts for:
     * - Reorder staging (ingredients below par)
     * - Purchase Orders to send
     * - Goods Receipts pending
     * - 3-Way Match pending
     *
     * @param restaurantId the restaurant ID
     * @return DTO containing all four count values
     */
    @GetMapping("/counts")
    public ResponseEntity<PurchasingHubCountsDTO> getHubCounts(@PathVariable Long restaurantId) {
        PurchasingHubCountsDTO counts = dashboardService.getHubCounts(restaurantId);
        return ResponseEntity.ok(counts);
    }
}
