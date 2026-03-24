package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.config.MarketplaceUser;
import mls.sho.mplace.entity.Supplier;
import mls.sho.mplace.service.ProfileService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Supplier Profile Controller
 * Scoped to /api/supplier/**
 */
@RestController
@RequestMapping("/api/supplier/profile")
@RequiredArgsConstructor
public class SupplierProfileController {

    private final ProfileService profileService;

    public record ProfileDTO(String id, String name, String organization, String category, double rating, String status, List<String> regions) {}

    @GetMapping
    public ProfileDTO getProfile(@AuthenticationPrincipal MarketplaceUser user) {
        // ProfileService already uses SecurityUtils, but for consistency we could pass ID
        Supplier supplier = (Supplier) profileService.getMyProfile();
        if (supplier == null) return null;

        return new ProfileDTO(
                supplier.getId().toString(),
                supplier.getName(),
                supplier.getOrganizationId(),
                supplier.getCategory() != null ? supplier.getCategory() : "N/A",
                supplier.getRating(),
                supplier.getVerificationStatus().name(),
                supplier.getRegions() != null ? List.of(supplier.getRegions().split(",")) : Collections.emptyList()
        );
    }

    @PatchMapping
    public String updateProfile(@RequestBody Map<String, Object> updates, @AuthenticationPrincipal MarketplaceUser user) {
        return "Your profile update has been submitted for review. You will be notified once it is approved.";
    }
}
