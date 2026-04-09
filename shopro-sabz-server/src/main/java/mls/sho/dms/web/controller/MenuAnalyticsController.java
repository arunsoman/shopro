package mls.sho.dms.web.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.analytics.MenuAnalyticsResponse;
import mls.sho.dms.application.service.menu.MenuAnalyticsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@RestController
@RequestMapping("/api/v1/menu-analytics")
@RequiredArgsConstructor
@Tag(name = "Menu Analytics", description = "Performance and profitability insights for menu management")
public class MenuAnalyticsController {

    private final MenuAnalyticsService service;

    @GetMapping("/overview")
    @Operation(summary = "Get menu overview analytics", description = "Fetch sales and margin data for items and categories")
    public MenuAnalyticsResponse getOverview(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to) {
        
        // Default to last 30 days if not provided
        if (to == null) to = Instant.now();
        if (from == null) from = to.minus(30, ChronoUnit.DAYS);
        
        return service.getOverview(from, to);
    }
}
