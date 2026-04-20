package com.shopro.accounting.controller;

import com.shopro.accounting.dto.TaxDTO;
import com.shopro.accounting.entity.TaxConfig;
import com.shopro.accounting.service.TaxService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/accounting/taxes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TaxController {

    private final TaxService taxService;

    /**
     * Get all tax configurations for a restaurant
     */
    @GetMapping
    public ResponseEntity<List<TaxConfig>> getTaxes(
        @RequestParam Long restaurantId
    ) {
        return ResponseEntity.ok(taxService.getTaxesForRestaurant(restaurantId));
    }

    /**
     * Create or update a tax configuration
     */
    @PostMapping
    public ResponseEntity<TaxConfig> saveTax(
        @Valid @RequestBody TaxConfig config
    ) {
        return ResponseEntity.ok(taxService.saveTaxConfig(config));
    }

    /**
     * Get recommended defaults for a specific country
     */
    @GetMapping("/defaults")
    public ResponseEntity<List<TaxConfig>> getCountryDefaults(
        @RequestParam String countryCode
    ) {
        // In a real system, this would fetch from a global seed database
        // For now, returning cached defaults based on common standards
        return ResponseEntity.ok(taxService.getGlobalDefaultsForCountry(countryCode));
    }

    /**
     * Delete a tax configuration
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTax(
        @PathVariable UUID id
    ) {
        taxService.deleteTax(id);
        return ResponseEntity.ok().build();
    }
}
