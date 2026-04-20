package mls.sho.dms.application.purchasing.web;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.purchasing.dto.PreferredVendorDto;
import mls.sho.dms.application.purchasing.service.PreferredVendorService;
import mls.sho.dms.application.purchasing.entity.PreferredVendor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/preferred-vendors")
@RequiredArgsConstructor
@Slf4j
public class PreferredVendorController {

    private final PreferredVendorService preferredVendorService;

    @GetMapping
    public ResponseEntity<List<PreferredVendorDto>> getAllPreferredVendors(
            @PathVariable Long restaurantId) {
        return ResponseEntity.ok(preferredVendorService.getAllPreferredVendors(restaurantId));
    }

    @GetMapping("/ingredient/{ingredientId}")
    public ResponseEntity<List<PreferredVendorDto>> getVendorsForIngredient(
            @PathVariable Long restaurantId,
            @PathVariable Long ingredientId) {
        return ResponseEntity.ok(preferredVendorService.getAllVendorsForIngredient(restaurantId, ingredientId));
    }

    @GetMapping("/preferred/ingredient/{ingredientId}")
    public ResponseEntity<PreferredVendorDto> getPreferredVendor(
            @PathVariable Long restaurantId,
            @PathVariable Long ingredientId) {
        return preferredVendorService.getPreferredVendor(restaurantId, ingredientId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<PreferredVendorDto>> getIngredientsBySupplier(
            @PathVariable Long supplierId) {
        return ResponseEntity.ok(preferredVendorService.getIngredientsBySupplier(supplierId));
    }

    @PostMapping
    public ResponseEntity<PreferredVendorDto> createPreferredVendor(@RequestBody PreferredVendor preferredVendor) {
        return ResponseEntity.ok(preferredVendorService.createPreferredVendor(preferredVendor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PreferredVendorDto> updatePreferredVendor(
            @PathVariable Long id,
            @RequestBody PreferredVendor preferredVendor) {
        return ResponseEntity.ok(preferredVendorService.updatePreferredVendor(id, preferredVendor));
    }

    @PutMapping("/preferred")
    public ResponseEntity<Void> setPreferredVendor(
            @PathVariable Long restaurantId,
            @RequestParam Long ingredientId,
            @RequestParam Long supplierId,
            @RequestParam(required = false) BigDecimal unitCost) {
        preferredVendorService.setPreferredVendor(restaurantId, ingredientId, supplierId, unitCost);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePreferredVendor(@PathVariable Long id) {
        preferredVendorService.deletePreferredVendor(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkPreferredVendor(
            @PathVariable Long restaurantId,
            @RequestParam Long ingredientId) {
        boolean hasPreferred = preferredVendorService.hasPreferredVendor(restaurantId, ingredientId);
        return ResponseEntity.ok(Map.of("hasPreferredVendor", hasPreferred));
    }
}