package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.MarketplaceSupplier;
import mls.sho.mplace.service.SupplierSettingsService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Supplier Settings Controller
 * Scoped to /api/supplier/**
 */
@RestController
@RequestMapping("/api/supplier/settings")
@RequiredArgsConstructor
public class SupplierSettingsController {

    private final SupplierSettingsService settingsService;

    @GetMapping
    public Map<String, Object> getSettings(@AuthenticationPrincipal MarketplaceSupplier principal) {
        return settingsService.getSettings(principal.getSupplierId());
    }

    @PatchMapping("/payout")
    public String updatePayout(@AuthenticationPrincipal MarketplaceSupplier principal, @RequestBody Map<String, String> details) {
        settingsService.updatePayout(principal.getSupplierId(), details);
        return "PAYOUT_UPDATE_INITIATED_24H_HOLD.CORE";
    }
}
