package mls.sho.dms.application.users.service;

import mls.sho.dms.application.users.exception.AuthException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.users.dto.AuthDtos.*;
import mls.sho.dms.application.users.repo.GuestOAuthAccountRepository;
import mls.sho.dms.application.users.repo.GuestRepository;
import mls.sho.dms.entity.users.Guest;
import mls.sho.dms.entity.users.GuestOAuthAccount;
import mls.sho.dms.entity.users.LoyaltyTier;
import mls.sho.dms.entity.users.OAuthProvider;
import mls.sho.dms.application.users.service.OAuth2Service.OAuthUserInfo;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GuestAuthService {
    
    private final GuestRepository guestRepo;
    private final GuestOAuthAccountRepository oauthRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OAuth2Service oauthService;
//    private final EmailService emailService ;
    private final AuditService auditService;
    
    @Transactional
    public GuestAuthResponse register(GuestRegisterRequest request, String ipAddress) {
        if (guestRepo.existsByEmail(request.getEmail())) {
            throw new AuthException("Email already registered");
        }
        
        Guest guest = Guest.builder()
            .email(request.getEmail())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .displayName(request.getDisplayName())
            .phone(request.getPhone())
            .isOauthOnly(false)
            .isVerified(false)
            .verificationToken(generateToken())
            .verificationExpiresAt(LocalDateTime.now().plusHours(24))
            .build();
        
        guest = guestRepo.save(guest);
        
//        emailService.sendVerificationEmail(guest.getEmail(), guest.getVerificationToken());
        
        auditService.log(guest.getGuestId(), "REGISTER", ipAddress, true);
        
        return login(guest, ipAddress, false);
    }
    
    @Transactional
    public GuestAuthResponse loginWithPassword(GuestLoginRequest request, String ipAddress) {
        Guest guest = guestRepo.findByEmailAndIsActiveTrue(request.getEmail())
            .orElseThrow(() -> new AuthException("Invalid credentials"));
        
        if (guest.getIsOauthOnly()) {
            throw new AuthException("Please use social login for this account");
        }
        
        if (!passwordEncoder.matches(request.getPassword(), guest.getPasswordHash())) {
            auditService.log(guest.getGuestId(), "PWD_FAIL", ipAddress, false);
            throw new AuthException("Invalid credentials");
        }
        
        return login(guest, ipAddress, false);
    }
    
    @Transactional
    public GuestAuthResponse handleOAuthCallback(String provider, OAuthCallbackRequest request, String ipAddress) {
        OAuthProvider oauthProvider = OAuthProvider.valueOf(provider.toUpperCase());
        
        // Exchange code for tokens and get user info from provider
        OAuthUserInfo userInfo = oauthService.fetchUserInfo(oauthProvider, request.getCode(), request.getRedirectUri());
        
        // Check if this OAuth account exists
        Optional<GuestOAuthAccount> existingOAuth = oauthRepo
            .findByProviderAndProviderSubject(oauthProvider, userInfo.getSubject());
        
        Guest guest;
        boolean isNew = false;
        
        if (existingOAuth.isPresent()) {
            // Existing OAuth user
            guest = existingOAuth.get().getGuest();
            updateOAuthTokens(existingOAuth.get(), userInfo);
        } else {
            // Check for existing guest with same email
            Optional<Guest> byEmail = guestRepo.findByEmailAndIsActiveTrue(userInfo.getEmail());
            
            if (byEmail.isPresent()) {
                // Link OAuth to existing account
                guest = byEmail.get();
                linkOAuthAccount(guest, oauthProvider, userInfo);
            } else {
                // Create new guest
                guest = createGuestFromOAuth(oauthProvider, userInfo);
                isNew = true;
            }
        }
        
        auditService.log(guest.getGuestId(), "OAUTH_LOGIN_" + provider, ipAddress, true);
        return login(guest, ipAddress, isNew);
    }
    
    private GuestAuthResponse login(Guest guest, String ipAddress, boolean isNew) {
        guest.setLastLoginAt(LocalDateTime.now());
        guest.setLastLoginIp(ipAddress);
        
        String accessToken = jwtService.generateGuestToken(guest);
        String refreshToken = jwtService.generateGuestRefreshToken(guest);
        
        List<String> linkedProviders = guest.getOauthAccounts().stream()
            .map(a -> a.getProvider().name().toLowerCase())
            .collect(Collectors.toList());
        
        return GuestAuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .expiresIn(604800) // 7 days
            .isNewGuest(isNew)
            .linkedProviders(linkedProviders)
            .guest(mapToDto(guest))
            .build();
    }
    
    private Guest createGuestFromOAuth(OAuthProvider provider, OAuthUserInfo userInfo) {
        Guest guest = Guest.builder()
            .email(userInfo.getEmail())
            .displayName(userInfo.getName())
            .isOauthOnly(true)
            .isVerified(true) // OAuth emails are pre-verified
            .loyaltyTier(LoyaltyTier.BRONZE)
            .build();
        
        guest = guestRepo.save(guest);
        
        GuestOAuthAccount oauth = GuestOAuthAccount.builder()
            .guest(guest)
            .provider(provider)
            .providerSubject(userInfo.getSubject())
            .providerEmail(userInfo.getEmail())
            .providerDisplayName(userInfo.getName())
            .providerAvatarUrl(userInfo.getPicture())
            .accessToken(encrypt(userInfo.getAccessToken()))
            .refreshToken(encrypt(userInfo.getRefreshToken()))
            .tokenExpiresAt(userInfo.getExpiresAt())
            .build();
        
        oauthRepo.save(oauth);
        guest.setOauthAccounts(List.of(oauth));
        
        return guest;
    }
    
    private void linkOAuthAccount(Guest guest, OAuthProvider provider, OAuthUserInfo userInfo) {
        GuestOAuthAccount oauth = GuestOAuthAccount.builder()
            .guest(guest)
            .provider(provider)
            .providerSubject(userInfo.getSubject())
            .providerEmail(userInfo.getEmail())
            .providerDisplayName(userInfo.getName())
            .build();
        
        oauthRepo.save(oauth);
        guest.getOauthAccounts().add(oauth);
        
        // If was OAuth-only, now has local + OAuth
        if (guest.getIsOauthOnly()) {
            guest.setIsOauthOnly(false);
        }
    }

    private void updateOAuthTokens(GuestOAuthAccount oauth, OAuthUserInfo userInfo) {
        oauth.setAccessToken(encrypt(userInfo.getAccessToken()));
        if (userInfo.getRefreshToken() != null) {
            oauth.setRefreshToken(encrypt(userInfo.getRefreshToken()));
        }
        oauth.setTokenExpiresAt(userInfo.getExpiresAt());
        oauthRepo.save(oauth);
    }

    private GuestDto mapToDto(Guest guest) {
        return GuestDto.builder()
            .guestId(guest.getGuestId())
            .email(guest.getEmail())
            .displayName(guest.getDisplayName())
            .phone(guest.getPhone())
            .loyaltyTier(guest.getLoyaltyTier() != null ? guest.getLoyaltyTier().name() : null)
            .points(guest.getLoyaltyPoints())
            .build();
    }

    private String generateToken() {
        return UUID.randomUUID().toString();
    }

    private String encrypt(String value) {
        if (value == null) return null;
        // Placeholder for encryption - in production use a real vault/KMS
        return java.util.Base64.getEncoder().encodeToString(value.getBytes());
    }

    public String generateOAuthUrl(String provider, String redirectUri) {
        return null;
    }
}