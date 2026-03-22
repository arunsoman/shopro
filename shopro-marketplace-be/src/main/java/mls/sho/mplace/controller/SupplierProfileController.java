package mls.sho.mplace.controller;
import lombok.RequiredArgsConstructor;

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

    private final mls.sho.mplace.service.ProfileService profileService;

    public record Profile(String id, String name, String organization, String category, double rating, String status, List<String> regions) {}

    @GetMapping
    public Profile getProfile() {
        var supplier = (mls.sho.mplace.entity.Supplier) profileService.getMyProfile();
        if (supplier == null) return null;

        return new Profile(
                supplier.getId().toString(),
                supplier.getName(),
                supplier.getOrganizationId(),
                supplier.getCategory() != null ? supplier.getCategory().name() : "N/A",
                supplier.getRating(),
                supplier.getVerificationStatus().name(),
                supplier.getRegions() != null ? List.of(supplier.getRegions().split(",")) : Collections.emptyList()
        );
    }

    @PatchMapping
    public String updateProfile(@RequestBody Map<String, Object> updates) {
        return "PROFILE_UPDATE_SUBMITTED_FOR_REVIEW.SIGNAL";
    }
}
