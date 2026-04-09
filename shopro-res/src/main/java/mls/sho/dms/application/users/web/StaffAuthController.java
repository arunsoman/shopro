package mls.sho.dms.application.users.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.users.dto.AuthDtos.*;
import mls.sho.dms.application.users.security.StaffPrincipal;
import mls.sho.dms.application.users.service.StaffAuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth/staff")
@RequiredArgsConstructor
@Validated
public class StaffAuthController {
    
    private final StaffAuthService authService;
    
    @GetMapping
    public ResponseEntity<List<StaffDto>> getStaff(@RequestParam("restaurantId") Long restaurantId) {
        return ResponseEntity.ok(authService.getStaffByRestaurant(restaurantId));
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
}