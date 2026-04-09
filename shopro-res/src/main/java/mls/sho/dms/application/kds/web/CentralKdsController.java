package mls.sho.dms.application.kds.web;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.kds.dto.KdsDtos.*;
import mls.sho.dms.application.kds.entity.KdsStation;
import mls.sho.dms.application.kds.service.ExpoKdsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * CENTRAL (MULTI-OUTLET) CONTROLLER — owner view
 */
@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/kds/central")
@RequiredArgsConstructor
public class CentralKdsController {

    private final ExpoKdsService expoService;

    /**
     * GET /api/kds/central/{restaurantId}/summary
     *
     * Live snapshot across all outlets. Owner or central
     * manager sees every kitchen at once.
     *
     * Auth: OWNER only.
     *
     * Response: OutletSummaryDto[]
     */
    @GetMapping("/summary")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<OutletSummaryDto>> getCentralSummary(
        @PathVariable Long restaurantId
    ) {
        return ResponseEntity.ok(expoService.getCentralSummary(restaurantId));
    }

    /**
     * GET /api/kds/central/{restaurantId}/analytics
     *     ?from=&to=&stationType=GRILL
     *
     * Compare prep times across all outlets.
     *
     * Response: CentralAnalyticsDto
     */
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<CentralAnalyticsDto> getCentralAnalytics(
        @PathVariable Long restaurantId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
        @RequestParam(required = false) KdsStation.StationType stationType
    ) {
        return ResponseEntity.ok(
            expoService.getCentralAnalytics(restaurantId, from, to, stationType)
        );
    }
}
