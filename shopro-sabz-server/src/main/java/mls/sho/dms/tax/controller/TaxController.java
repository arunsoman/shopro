package mls.sho.dms.tax.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.tax.dto.request.TaxCalculationRequest;
import mls.sho.dms.tax.dto.response.TaxCalculationResponse;
import mls.sho.dms.tax.entity.Country;
import mls.sho.dms.tax.entity.TaxRule;
import mls.sho.dms.tax.entity.VenueCountryAssignment;
import mls.sho.dms.tax.service.TaxConfigService;
import mls.sho.dms.tax.engine.TaxEngine;
import org.springframework.http.ResponseEntity;
import mls.sho.dms.application.security.StaffMemberPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/taxes")
@RequiredArgsConstructor
public class TaxController {

    private final TaxConfigService configService;
    private final TaxEngine taxEngine;

    @GetMapping("/countries")
    public List<Country> getCountries() {
        return configService.getAllCountries();
    }

    @GetMapping("/rules/{isoCode}")
    public List<TaxRule> getRules(@PathVariable String isoCode) {
        return configService.getRulesForCountry(isoCode);
    }

    @GetMapping("/venue/{venueId}")
    public ResponseEntity<VenueCountryAssignment> getVenueAssignment(@PathVariable UUID venueId) {
        VenueCountryAssignment assignment = configService.getVenueAssignment(venueId);
        if (assignment == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(assignment);
    }

    @PostMapping("/calculate")
    public ResponseEntity<TaxCalculationResponse> calculate(@Valid @RequestBody TaxCalculationRequest request) {
        // In a real app, we'd get venueId from the security context or session.
        // For simulation purpose, we use a placeholder venue ID or allow passing one if needed.
        UUID mockVenueId = UUID.fromString("00000000-0000-0000-0000-000000000000"); // Standard Default Venue
        return ResponseEntity.ok(taxEngine.calculate(request, mockVenueId));
    }

    @PostMapping("/assign")
    public ResponseEntity<Void> assignCountry(
            @RequestParam UUID venueId, 
            @RequestParam String isoCode,
            java.security.Principal principal) {
        
        StaffMemberPrincipal staffPrincipal = extractStaffPrincipal(principal);
        validateAdminRole(staffPrincipal);

        configService.assignCountryToVenue(venueId, isoCode, staffPrincipal.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/override")
    public ResponseEntity<Void> setOverride(
            @RequestParam UUID venueId, 
            @RequestParam UUID ruleId, 
            @RequestParam BigDecimal rate,
            @RequestParam String reason,
            java.security.Principal principal) {
        
        StaffMemberPrincipal staffPrincipal = extractStaffPrincipal(principal);
        validateAdminRole(staffPrincipal);

        configService.setRateOverride(venueId, ruleId, rate, reason, staffPrincipal.getId());
        return ResponseEntity.ok().build();
    }

    private StaffMemberPrincipal extractStaffPrincipal(java.security.Principal principal) {
        if (principal instanceof StaffMemberPrincipal) {
            return (StaffMemberPrincipal) principal;
        }
        return null; // Fallback
    }

    private void validateAdminRole(StaffMemberPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        String role = principal.getRole();
        if (!"OWNER".equals(role) && !"MANAGER".equals(role) && !"GENERAL_MANAGER".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Insufficient permissions");
        }
    }
}
