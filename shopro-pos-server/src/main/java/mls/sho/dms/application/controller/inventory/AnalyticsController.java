package mls.sho.dms.application.controller.inventory;

import mls.sho.dms.application.service.inventory.AnalyticsService;
import mls.sho.dms.application.service.inventory.dto.TvaReportRow;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/tva-report")
    public ResponseEntity<List<TvaReportRow>> getTvaReport(
            @RequestParam Instant startDate,
            @RequestParam Instant endDate) {
        return ResponseEntity.ok(analyticsService.generateTvaReport(startDate, endDate));
    }
}
