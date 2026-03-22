package mls.sho.mplace.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record RestaurantManagementDto(
    UUID id,
    String name,
    String category,
    BigDecimal volume,
    String status,
    Integer trustScore,
    String city,
    Integer membersCount,
    String imageUrl
) {}
