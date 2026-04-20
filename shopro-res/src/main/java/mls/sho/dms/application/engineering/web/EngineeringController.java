package mls.sho.dms.application.engineering.web;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.engineering.entity.MenuEngineeringPeriod;
import mls.sho.dms.application.engineering.service.MenuEngineeringPeriodService;
import mls.sho.dms.application.engineering.service.MenuEngineeringService;
import mls.sho.dms.application.pos.repository.MenuItemRepository;
import mls.sho.dms.application.pos.entity.MenuItem;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/menu-engineering")
@RequiredArgsConstructor
public class EngineeringController {

    private final MenuEngineeringService engineeringService;
    private final MenuItemRepository menuItemRepository;
    private final MenuEngineeringPeriodService periodService;

    @PostMapping("/run")
    public List<MenuEngineeringService.MenuEngResult> runAnalysis(
            @PathVariable Long restaurantId,
            @RequestBody List<Integer> quantitiesSold) {
        List<MenuItem> items = menuItemRepository.findAllByRestaurantId(restaurantId);
        return engineeringService.runAnalysis(items, quantitiesSold);
    }

    @GetMapping("/periods")
    public ResponseEntity<List<Map<String, Object>>> getPeriods(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(periodService.getPeriods(restaurantId));
    }

    @GetMapping("/periods/{periodId}/results")
    public ResponseEntity<List<MenuEngineeringService.MenuEngResult>> getPeriodResults(
            @PathVariable Long restaurantId,
            @PathVariable Long periodId) {
        return ResponseEntity.ok(periodService.getPeriodResults(restaurantId, periodId));
    }

    @GetMapping("/periods/{periodId}/summary")
    public ResponseEntity<Map<String, Object>> getPeriodSummary(
            @PathVariable Long restaurantId,
            @PathVariable Long periodId) {
        return ResponseEntity.ok(periodService.getPeriodSummary(restaurantId, periodId));
    }

    @PostMapping("/periods")
    public ResponseEntity<MenuEngineeringPeriod> createPeriod(
            @PathVariable Long restaurantId,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.status(201).body(periodService.createPeriod(restaurantId, body));
    }

    @PostMapping("/periods/{periodId}/run")
    public ResponseEntity<MenuEngineeringPeriod> runPeriod(
            @PathVariable Long restaurantId,
            @PathVariable Long periodId) {
        return ResponseEntity.ok(periodService.runPeriod(restaurantId, periodId));
    }

    @PostMapping("/periods/{periodId}/simulate")
    public ResponseEntity<List<MenuEngineeringService.MenuEngResult>> simulatePeriod(
            @PathVariable Long restaurantId,
            @PathVariable Long periodId,
            @RequestBody(required = false) Map<String, Object> overrides) {
        return ResponseEntity.ok(periodService.simulatePeriod(restaurantId, periodId, overrides));
    }

    @PostMapping("/periods/compare")
    public ResponseEntity<Map<String, Object>> comparePeriods(
            @PathVariable Long restaurantId,
            @RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<Long> periodIds = (List<Long>) body.get("periodIds");
        return ResponseEntity.ok(periodService.comparePeriods(restaurantId, periodIds));
    }
}
