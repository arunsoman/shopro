package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.MarketplaceSupplier;
import mls.sho.mplace.service.SupplierDashboardService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Supplier Dashboard Controller
 * Scoped to /api/supplier/**
 */
@RestController
@RequestMapping("/api/supplier/dashboard")
@RequiredArgsConstructor
public class SupplierDashboardController {

    private final SupplierDashboardService dashboardService;

    @GetMapping("/stats")
    public SupplierDashboardService.DashboardStats getStats(@AuthenticationPrincipal MarketplaceSupplier supplier) {
        return dashboardService.getStats(supplier);
    }

    @GetMapping("/activity")
    public List<SupplierDashboardService.RecentActivity> getActivity(@AuthenticationPrincipal MarketplaceSupplier supplier) {
        return dashboardService.getActivity(supplier);
    }

    @GetMapping("/performance")
    public Map<String, Object> getPerformance(@AuthenticationPrincipal MarketplaceSupplier supplier) {
        return Map.of(
            "fulfillment", 98.4,
            "onTimeDelivery", 95.2,
            "qualityIndex", 99.1,
            "leadResponseTime", "24m"
        );
    }
}
