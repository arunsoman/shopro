package mls.sho.dms.application.users.service;

import mls.sho.dms.application.users.exception.AuthException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.users.dto.AuthDtos.*;
import mls.sho.dms.application.users.repo.ShoProUserRepository;
import mls.sho.dms.entity.users.ShoProUser;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShoProAuthService {
    
    private final ShoProUserRepository shoproRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final MfaService mfaService;
    private final AuditService auditService;
    
    private static final int MAX_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 30;
    
    @Transactional
    public ShoProLoginResponse login(ShoProLoginRequest request, String fingerprint, String ipAddress) {
        ShoProUser user = shoproRepo.findByUsernameAndIsActiveTrue(request.getUsername())
            .orElseThrow(() -> new AuthException("Invalid credentials"));
        
        // Check lockout
        if (user.isLocked()) {
            throw new AuthException("Account locked. Try again in " + LOCK_DURATION_MINUTES + " minutes.");
        }
        
        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            handleFailedLogin(user);
            auditService.log(user.getShoproId(), "PWD_FAIL", ipAddress, false);
            throw new AuthException("Invalid credentials");
        }
        
        // Check password expiration
        if (user.isPasswordExpired() || user.getRequirePasswordChange()) {
            String tempToken = jwtService.generatePasswordResetToken(user);
            return ShoProLoginResponse.builder()
                .requiresPasswordChange(true)
                .passwordChangeToken(tempToken)
                .build();
        }
        
        // Check MFA
        if (Boolean.TRUE.equals(user.getMfaEnabled())) {
            if (request.getMfaCode() == null) {
                return ShoProLoginResponse.builder()
                    .requiresMfa(true)
                    .mfaToken(jwtService.generateMfaTempToken(user))
                    .build();
            }
            
            if (!mfaService.verifyCode(user.getMfaSecret(), request.getMfaCode())) {
                throw new AuthException("Invalid MFA code");
            }
        }
        
        // Success
        return completeLogin(user, fingerprint, ipAddress);
    }
    
    private ShoProLoginResponse completeLogin(ShoProUser user, String fingerprint, String ipAddress) {
        shoproRepo.resetFailedAttempts(user.getShoproId());
        
        user.setLastLoginAt(LocalDateTime.now());
        user.setLastLoginIp(ipAddress);
        
        String accessToken = jwtService.generateShoProToken(user);
        String refreshToken = jwtService.generateShoProRefreshToken(user);
        
        // Store refresh token hash for revocation capability
        user.setRefreshTokenHash(hashToken(refreshToken));
        user.setRefreshTokenExpiresAt(LocalDateTime.now().plusDays(7));
        
        auditService.log(user.getShoproId(), "LOGIN", ipAddress, true);
        
        return ShoProLoginResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .expiresIn(3600)
            .shopro(mapToDto(user))
            .build();
    }
    
    @Transactional
    public ShoProLoginResponse verifyMfa(String mfaToken, String mfaCode) {
        if (!jwtService.isTokenValid(mfaToken) ||
                !"MFA_PENDING".equals(jwtService.extractTokenType(mfaToken))) {
            throw new AuthException("Invalid or expired MFA token");
        }

        UUID shoproId = jwtService.extractUserId(mfaToken);
        ShoProUser user = shoproRepo.findById(shoproId)
                .orElseThrow(() -> new AuthException("User not found"));

        if (!mfaService.verifyCode(user.getMfaSecret(), mfaCode)) {
            auditService.log(user.getShoproId(), "MFA_FAIL", "unknown", false);
            throw new AuthException("Invalid MFA code");
        }

        return completeLogin(user, "mfa-verified", "unknown");
    }

    @Transactional
    public void changePassword(UUID shoproId, PasswordChangeRequest request) {
        ShoProUser user = shoproRepo.findById(shoproId)
            .orElseThrow(() -> new AuthException("User not found"));
        
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new AuthException("Current password incorrect");
        }
        
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChangedAt(LocalDateTime.now());
        user.setRequirePasswordChange(false);
    }
    
    private void handleFailedLogin(ShoProUser user) {
        shoproRepo.incrementFailedAttempts(user.getShoproId());
        // Null-safe: existing rows may have null if created before @Builder.Default was added
        int currentAttempts = user.getFailedLoginAttempts() == null ? 0 : user.getFailedLoginAttempts();
        if (currentAttempts + 1 >= MAX_ATTEMPTS) {
            user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES));
            shoproRepo.save(user);
        }
    }

    private ShoProUserDto mapToDto(ShoProUser user) {
        return ShoProUserDto.builder()
            .shoproId(user.getShoproId())
            .username(user.getUsername())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .mfaEnabled(Boolean.TRUE.equals(user.getMfaEnabled()))
            .build();
    }

    private String hashToken(String token) {
        // Simple SHA-256 for refresh token storage
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return java.util.Base64.getEncoder().encodeToString(hash);
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException("Hash algorithm not found", e);
        }
    }
}