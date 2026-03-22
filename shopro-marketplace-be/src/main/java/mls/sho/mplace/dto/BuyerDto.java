package mls.sho.mplace.dto;

import java.util.UUID;

public record BuyerDto(
    UUID id,
    String email,
    String fullName,
    String restaurantName,
    String status
) {}
