package mls.sho.mplace.dto;

import java.util.UUID;

public record RestaurantOnboardingDto(
    UUID id,
    String name,
    String category,
    String city,
    String address,
    String contactPerson,
    String contactInfo,
    String verificationStatus
) {}
