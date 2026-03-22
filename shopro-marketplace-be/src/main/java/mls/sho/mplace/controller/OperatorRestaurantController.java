package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.dto.RestaurantManagementDto;
import mls.sho.mplace.dto.RestaurantOnboardingDto;
import mls.sho.mplace.entity.Restaurant;
import mls.sho.mplace.repository.RestaurantRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
import mls.sho.mplace.service.UserManagementService;

@RestController
@RequestMapping("/api/operator/restaurants")
@RequiredArgsConstructor
public class OperatorRestaurantController {

    private final UserManagementService userManagementService;
    private final RestaurantRepository restaurantRepository;

    @GetMapping
    public List<RestaurantManagementDto> getRestaurants() {
        return restaurantRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    @PatchMapping("/{id}/status")
    public void updateStatus(@PathVariable UUID id, @RequestParam String status) {
        userManagementService.updateRestaurantStatus(id, status);
    }

    @PostMapping("/onboarding")
    public RestaurantOnboardingDto onboard(@RequestBody RestaurantOnboardingDto dto) {
        Restaurant r = new Restaurant();
        updateEntityFromDto(r, dto);
        r = restaurantRepository.save(r);
        return mapToOnboardingDto(r);
    }

    @PatchMapping("/onboarding/{id}")
    public RestaurantOnboardingDto updateOnboarding(@PathVariable UUID id, @RequestBody RestaurantOnboardingDto dto) {
        return restaurantRepository.findById(id).map(r -> {
            updateEntityFromDto(r, dto);
            r = restaurantRepository.save(r);
            return mapToOnboardingDto(r);
        }).orElseThrow();
    }

    private void updateEntityFromDto(Restaurant r, RestaurantOnboardingDto dto) {
        r.setName(dto.name());
        r.setCategory(dto.category());
        r.setCity(dto.city());
        r.setAddress(dto.address());
        r.setContactPerson(dto.contactPerson());
        r.setContactInfo(dto.contactInfo());
        if (dto.verificationStatus() != null) {
            r.setVerificationStatus(Restaurant.VerificationStatus.valueOf(dto.verificationStatus()));
        }
    }

    private RestaurantManagementDto mapToDto(Restaurant r) {
        return new RestaurantManagementDto(
                r.getId(),
                r.getName(),
                r.getCategory(),
                r.getVolume(),
                r.getVerificationStatus().name(),
                r.getTrustScore(),
                r.getCity(),
                r.getMembersCount(),
                r.getImageUrl()
        );
    }

    private RestaurantOnboardingDto mapToOnboardingDto(Restaurant r) {
        return new RestaurantOnboardingDto(
                r.getId(),
                r.getName(),
                r.getCategory(),
                r.getCity(),
                r.getAddress(),
                r.getContactPerson(),
                r.getContactInfo(),
                r.getVerificationStatus().name()
        );
    }
}
