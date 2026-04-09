package mls.sho.dms.application.users.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.pos.repository.RestaurantRepository;
import mls.sho.dms.application.users.dto.OnboardingDtos.*;
import mls.sho.dms.application.users.exception.AuthException;
import mls.sho.dms.application.users.repo.ShoProUserRepository;
import mls.sho.dms.entity.Restaurant;
import mls.sho.dms.entity.users.ShoProUser;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;

@Service
@RequiredArgsConstructor
@Slf4j
public class OnboardingService {

    private final RestaurantRepository restaurantRepo;
    private final ShoProUserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public OnboardingResponse onboardRestaurantWithAdmin(RestaurantOnboardingRequest request) {
        log.info("Onboarding new restaurant: {} with admin: {}", request.getName(), request.getAdminUsername());

        // 1. Validation
        if (userRepo.existsByUsername(request.getAdminUsername())) {
            throw new AuthException("Username already exists");
        }
        if (userRepo.existsByEmail(request.getAdminEmail())) {
            throw new AuthException("Email already exists");
        }

        // 2. Create Restaurant
        Restaurant restaurant = new Restaurant();
        restaurant.setName(request.getName());
        restaurant.setTimezone(request.getTimezone());
        restaurant.setCreatedAt(LocalDateTime.now());
        restaurant.setUpdatedAt(LocalDateTime.now());
        restaurant = restaurantRepo.save(restaurant);

        // 3. Create Admin User
        ShoProUser admin = ShoProUser.builder()
            .username(request.getAdminUsername())
            .email(request.getAdminEmail())
            .fullName(request.getAdminFullName())
            .passwordHash(passwordEncoder.encode("password")) // Default password
            .restaurantId(restaurant.getId())
            .isActive(true)
            .mfaEnabled(false)
            .requirePasswordChange(true)
            .permissions(Collections.singletonList("ROLE_RESTAURANT_ADMIN"))
            .build();

        userRepo.save(admin);

        return OnboardingResponse.builder()
            .restaurantId(restaurant.getId())
            .restaurantName(restaurant.getName())
            .adminUsername(admin.getUsername())
            .defaultPassword("password")
            .message("Restaurant onboarded successfully. Please change the password upon first login.")
            .build();
    }
}
