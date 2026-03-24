package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.config.MarketplaceUser;
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
    public Map<String, Object> getSettings(@AuthenticationPrincipal MarketplaceUser user) {
        return settingsService.getSettings(user.getSupplierId());
    }

    @PatchMapping("/payout")
    public String updatePayout(@AuthenticationPrincipal MarketplaceUser user, @RequestBody Map<String, String> details) {
        settingsService.updatePayout(user.getSupplierId(), details);
        return "Payout update initiated. A 24-hour verification hold is active.";
    }
}
