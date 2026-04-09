package mls.sho.dms.application.users.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.users.dto.AuthDtos.*;
import mls.sho.dms.application.users.service.GuestAuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth/guest")
@RequiredArgsConstructor
@Validated
public class GuestAuthController {
    
    private final GuestAuthService authService;
    
    @PostMapping("/register")
    public ResponseEntity<GuestAuthResponse> register(
            @Valid @RequestBody GuestRegisterRequest request,
            HttpServletRequest httpRequest) {
        
        GuestAuthResponse response = authService.register(
            request,
            httpRequest.getRemoteAddr()
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PostMapping("/login")
    public ResponseEntity<GuestAuthResponse> login(
            @Valid @RequestBody GuestLoginRequest request,
            HttpServletRequest httpRequest) {
        
        GuestAuthResponse response = authService.loginWithPassword(
            request,
            httpRequest.getRemoteAddr()
        );
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/oauth/{provider}/url")
    public ResponseEntity<OAuthUrlResponse> getOAuthUrl(
            @PathVariable String provider,
            @RequestParam String redirectUri) {
        
        String url = authService.generateOAuthUrl(provider, redirectUri);
        return ResponseEntity.ok(OAuthUrlResponse.builder().url(url).build());
    }
    
    @PostMapping("/oauth/{provider}/callback")
    public ResponseEntity<GuestAuthResponse> oauthCallback(
            @PathVariable String provider,
            @Valid @RequestBody OAuthCallbackRequest request,
            HttpServletRequest httpRequest) {
        
        GuestAuthResponse response = authService.handleOAuthCallback(
            provider,
            request,
            httpRequest.getRemoteAddr()
        );
        
        return ResponseEntity.ok(response);
    }
}