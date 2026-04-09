package mls.sho.dms.application.users.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class OnboardingDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RestaurantOnboardingRequest {
        @NotBlank(message = "Restaurant name is required")
        private String name;
        
        @NotBlank(message = "Timezone is required")
        private String timezone;
        
        @NotBlank(message = "Admin username is required")
        private String adminUsername;
        
        @NotBlank(message = "Admin full name is required")
        private String adminFullName;
        
        @NotBlank(message = "Admin email is required")
        @Email(message = "Invalid email format")
        private String adminEmail;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OnboardingResponse {
        private Long restaurantId;
        private String restaurantName;
        private String adminUsername;
        private String defaultPassword;
        private String message;
    }
}
