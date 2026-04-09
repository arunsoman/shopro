package mls.sho.dms.application.users.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.users.dto.OnboardingDtos.*;
import mls.sho.dms.application.users.service.OnboardingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/onboarding")
@RequiredArgsConstructor
@Validated
public class OnboardingController {

    private final OnboardingService onboardingService;

    @PostMapping("/restaurant")
    @PreAuthorize("hasRole('ADMIN')") // Platform Administrator only
    public ResponseEntity<OnboardingResponse> onboardRestaurant(@Valid @RequestBody RestaurantOnboardingRequest request) {
        OnboardingResponse response = onboardingService.onboardRestaurantWithAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
