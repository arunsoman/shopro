package mls.sho.dms.web.controller.inventory;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.inventory.InventoryDashboardResponse;
import mls.sho.dms.application.service.inventory.AnalyticsService;
import mls.sho.dms.application.service.inventory.dto.TvaReportRow;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

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

    @GetMapping("/tva-report")
    public ResponseEntity<List<TvaReportRow>> getTvaReport(
            @RequestParam Instant startDate,
            @RequestParam Instant endDate) {
        return ResponseEntity.ok(analyticsService.generateTvaReport(startDate, endDate));
    }
}
