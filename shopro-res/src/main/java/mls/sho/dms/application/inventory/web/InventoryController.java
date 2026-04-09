package mls.sho.dms.application.inventory.web;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.inventory.dto.InventoryDtos.*;
import mls.sho.dms.application.inventory.service.IngredientService;
import mls.sho.dms.application.inventory.service.InventoryIntelligenceService;
import mls.sho.dms.application.inventory.service.InventoryService;
import mls.sho.dms.application.inventory.service.InventoryStats;
import mls.sho.dms.application.inventory.service.PhysicalInventoryService;
import mls.sho.dms.common.enums.InventoryType;
import mls.sho.dms.entity.Ingredient;
import mls.sho.dms.entity.Restaurant;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;
    private final IngredientService ingredientService;
    private final InventoryIntelligenceService inventoryIntelligenceService;
    private final PhysicalInventoryService physicalInventoryService;

    @GetMapping("/stats")
    public InventoryStats getStats(@PathVariable Long restaurantId) {
        return inventoryService.getInventoryHubStats(restaurantId, ingredientService);
    }

    /**
     * Shows the latest perpetual inventory status.
     * Derived in real-time from the ledger.
     */
    @GetMapping("/latest")
    public LatestInventoryDto getLatestInventory(
            @PathVariable Long restaurantId,
            @RequestParam InventoryType type) {
        return inventoryService.getLatestInventory(restaurantId, type);
    }

    @GetMapping("/periods/latest")
    public LatestInventoryDto getLatestInventoryPeriod(
            @PathVariable Long restaurantId,
            @RequestParam InventoryType type) {
        return inventoryService.getLatestInventory(restaurantId, type);
    }

    /**
     * Aligns the perpetual ledger with a physical count.
     */
    @PostMapping("/reconcile/{ingredientId}")
    public ResponseEntity<Void> reconcile(
            @PathVariable Long restaurantId,
            @PathVariable Long ingredientId,
            @RequestBody Map<String, BigDecimal> body) {
        
        Restaurant res = new Restaurant();
        res.setId(restaurantId);
        
        inventoryService.reconcile(res, ingredientId, body.get("count"), "PHYSICAL_COUNT");
        return ResponseEntity.ok().build();
    }

    /**
     * Records a physical shipment receipt.
     * Primarily used by the simulation to back-fill historical inflows.
     */
    @PostMapping("/receive/{ingredientId}")
    public ResponseEntity<Void> receive(
            @PathVariable Long restaurantId,
            @PathVariable Long ingredientId,
            @RequestBody Map<String, Object> payload) {
        
        Ingredient ing = ingredientService.getIngredient(ingredientId);
        BigDecimal qty = new BigDecimal(payload.get("quantity").toString());
        BigDecimal cost = new BigDecimal(payload.get("unitCost").toString());
        
        LocalDateTime createdAt = null;
        if (payload.containsKey("createdAt")) {
            createdAt = LocalDateTime.parse(payload.get("createdAt").toString());
        }

        inventoryIntelligenceService.receiveShipment(null, ing, qty, cost, BigDecimal.ZERO, createdAt);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/ingredients")
    public ResponseEntity<List<mls.sho.dms.entity.Ingredient>> getIngredients(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(ingredientService.getAllIngredients(restaurantId));
    }

    @GetMapping("/ingredients/{ingredientId}/quantity")
    public ResponseEntity<BigDecimal> getQuantity(@PathVariable Long restaurantId, @PathVariable Long ingredientId) {
        return ResponseEntity.ok(inventoryIntelligenceService.getLiveQuantity(restaurantId, ingredientId));
    }

    // -- Period-based physical inventory endpoints ----------

    @GetMapping("/periods")
    public ResponseEntity<List<Map<String, Object>>> getInventoryPeriods(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(physicalInventoryService.getPeriods(restaurantId));
    }

    @GetMapping("/periods/current")
    public ResponseEntity<PhysicalInventoryPeriodDto> getCurrentPeriod(
            @PathVariable Long restaurantId,
            @RequestParam(required = false) String type) {
        InventoryType invType = type != null ? InventoryType.valueOf(type.toUpperCase()) : InventoryType.FOOD;
        return ResponseEntity.ok(physicalInventoryService.getCurrentPeriod(restaurantId, invType));
    }

    @GetMapping("/periods/{periodId}/detail")
    public ResponseEntity<Map<String, Object>> getPeriodDetail(
            @PathVariable Long restaurantId,
            @PathVariable Long periodId) {
        return ResponseEntity.ok(physicalInventoryService.getPeriodDetail(restaurantId, periodId));
    }

    @PostMapping("/periods")
    public ResponseEntity<PhysicalInventoryPeriodDto> createPeriod(
            @PathVariable Long restaurantId,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.status(201).body(physicalInventoryService.createPeriod(restaurantId, body));
    }

    @PutMapping("/periods/{periodId}/lines/{lineId}/count")
    public ResponseEntity<PhysicalInventoryLineDto> updateLineCount(
            @PathVariable Long restaurantId,
            @PathVariable Long periodId,
            @PathVariable Long lineId,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(physicalInventoryService.updateLineCount(restaurantId, periodId, lineId, body));
    }

    @PostMapping("/periods/{periodId}/lines/batch")
    public ResponseEntity<List<PhysicalInventoryLineDto>> batchUpdateLines(
            @PathVariable Long restaurantId,
            @PathVariable Long periodId,
            @RequestBody List<Map<String, Object>> updates) {
        return ResponseEntity.ok(physicalInventoryService.batchUpdateLines(restaurantId, periodId, updates));
    }

    @PostMapping("/periods/{periodId}/finalise")
    public ResponseEntity<PhysicalInventoryPeriodDto> finalisePeriod(
            @PathVariable Long restaurantId,
            @PathVariable Long periodId) {
        return ResponseEntity.ok(physicalInventoryService.finalisePeriod(restaurantId, periodId));
    }

    @GetMapping("/periods/{id1}/compare/{id2}")
    public ResponseEntity<Map<String, Object>> comparePeriods(
            @PathVariable Long restaurantId,
            @PathVariable Long id1,
            @PathVariable Long id2) {
        return ResponseEntity.ok(physicalInventoryService.comparePeriods(restaurantId, id1, id2));
    }
}
