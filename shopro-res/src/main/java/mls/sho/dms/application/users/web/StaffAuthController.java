package mls.sho.dms.application.users.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.users.dto.AuthDtos.*;
import mls.sho.dms.application.users.security.StaffPrincipal;
import mls.sho.dms.application.users.service.StaffAuthService;
import mls.sho.dms.application.users.service.StaffCompensationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/staff")
@RequiredArgsConstructor
@Validated
@CrossOrigin(origins = "*")
public class StaffAuthController {
    
    private final StaffAuthService authService;
    private final StaffCompensationService compensationService;
    
    @GetMapping
    public ResponseEntity<List<StaffDto>> getStaff(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(authService.getStaffByRestaurant(restaurantId));
    }
    
    @GetMapping("/{staffId}")
    public ResponseEntity<StaffDto> getStaffById(@PathVariable Long restaurantId, @PathVariable UUID staffId) {
        return ResponseEntity.ok(authService.getStaffById(staffId));
    }
    
    @PatchMapping("/{staffId}/hourly-rate")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'GENERAL_MANAGER', 'ADMIN')")
    public ResponseEntity<StaffDto> updateHourlyRate(
            @PathVariable Long restaurantId,
            @PathVariable UUID staffId,
            @RequestBody HourlyRateRequest request) {
        return ResponseEntity.ok(authService.updateHourlyRate(staffId, request.getHourlyRate()));
    }
    
    @PostMapping("/login")
    public ResponseEntity<StaffLoginResponse> login(
            @Valid @RequestBody StaffLoginRequest request,
            @RequestHeader("X-Device-Fingerprint") String fingerprint,
            HttpServletRequest httpRequest) {
        
        StaffLoginResponse response = authService.login(
            request, 
            fingerprint, 
            httpRequest.getRemoteAddr()
        );
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/shift/start")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<Void> startShift(
            @AuthenticationPrincipal StaffPrincipal principal,
            HttpServletRequest request) {
        
        authService.startShift(principal.getStaffId(), request.getRemoteAddr());
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/shift/end")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<Void> endShift(
            @AuthenticationPrincipal StaffPrincipal principal,
            HttpServletRequest request) {
        
        authService.endShift(principal.getStaffId(), request.getRemoteAddr());
        return ResponseEntity.ok().build();
    }
    
    // DTO for hourly rate update
    @lombok.Data
    public static class HourlyRateRequest {
        private BigDecimal hourlyRate;
    }
}