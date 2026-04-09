package mls.sho.dms.application.users.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.users.dto.AuthDtos.*;
import mls.sho.dms.application.users.security.ShoProPrincipal;
import mls.sho.dms.application.users.service.ShoProAuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth/shopro")
@RequiredArgsConstructor
@Validated
public class ShoProAuthController {
    
    private final ShoProAuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<ShoProLoginResponse> login(
            @Valid @RequestBody ShoProLoginRequest request,
            @RequestHeader("X-Device-Fingerprint") String fingerprint,
            HttpServletRequest httpRequest) {
        
        ShoProLoginResponse response = authService.login(
            request,
            fingerprint,
            httpRequest.getRemoteAddr()
        );
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/password/change")
    @PreAuthorize("hasRole('SHOPRO')")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal ShoProPrincipal principal,
            @Valid @RequestBody PasswordChangeRequest request) {

        authService.changePassword(principal.getShoproId(), request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/mfa/verify")
    public ResponseEntity<ShoProLoginResponse> verifyMfa(
            @RequestBody Map<String, String> body) {
        String mfaToken = body.get("mfaToken");
        String mfaCode = body.get("mfaCode");
        return ResponseEntity.ok(authService.verifyMfa(mfaToken, mfaCode));
    }
}