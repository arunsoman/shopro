package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.service.BuyerDashboardService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Buyer (Restaurant) Dashboard Controller
 * Scoped to /api/buyer/**
 */
@RestController
@RequestMapping("/api/buyer/dashboard")
@RequiredArgsConstructor
public class BuyerDashboardController {

    private final BuyerDashboardService dashboardService;

    @GetMapping("/stats")
    public BuyerDashboardService.BuyerStats getStats() {
        return dashboardService.getStats();
    }

    @GetMapping("/activity")
    public List<BuyerDashboardService.Activity> getRecentActivity() {
        return dashboardService.getRecentActivity();
    }
}
