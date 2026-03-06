package mls.sho.dms.web.controller.inventory;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.inventory.InventoryDashboardResponse;
import mls.sho.dms.application.service.inventory.AnalyticsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/inventory/analytics")
@RequiredArgsConstructor
@Tag(name = "Inventory Analytics", description = "Performance and financial tracking")
public class InventoryAnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public InventoryDashboardResponse getDashboardStats() {
        return analyticsService.getDashboardStats();
    }
}
