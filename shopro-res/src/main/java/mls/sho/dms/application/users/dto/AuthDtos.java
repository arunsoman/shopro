package mls.sho.dms.application.users.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class AuthDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShoProLoginRequest {
        private String username;
        private String password;
        private String mfaCode;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShoProLoginResponse {
        private String accessToken;
        private String refreshToken;
        private Integer expiresIn;
        private boolean requiresMfa;
        private String mfaToken;
        private boolean requiresPasswordChange;
        private String passwordChangeToken;
        private ShoProUserDto shopro;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShoProUserDto {
        private UUID shoproId;
        private String username;
        private String email;
        private String fullName;
        private boolean mfaEnabled;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StaffLoginRequest {
        private UUID staffId;
        private String pin;
        private Long restaurantId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StaffLoginResponse {
        private String accessToken;
        private String refreshToken;
        private Integer expiresIn;
        private Long restaurantId;
        private String restaurantName;
        private StaffDto staff;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StaffDto {
        private UUID staffId;
        private String name;
        private String role;
        private boolean shiftActive;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PasswordChangeRequest {
        private String currentPassword;
        private String newPassword;
    }

    // --- Guest DTOs ---

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GuestRegisterRequest {
        private String email;
        private String password;
        private String displayName;
        private String phone;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GuestLoginRequest {
        private String email;
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GuestAuthResponse {
        private String accessToken;
        private String refreshToken;
        private Integer expiresIn;
        private boolean isNewGuest;
        private List<String> linkedProviders;
        private GuestDto guest;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GuestDto {
        private UUID guestId;
        private String email;
        private String displayName;
        private String phone;
        private String loyaltyTier;
        private Integer points;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OAuthUrlResponse {
        private String url;
        private String state;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OAuthCallbackRequest {
        private String code;
        private String state;
        private String redirectUri;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MfaSetupResult {
        private String secret;
        private String qrCodeUrl;
        private List<String> backupCodes;
    }
}
