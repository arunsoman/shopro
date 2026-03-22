package mls.sho.mplace.dto;

import java.util.UUID;

public record FoodInventoryDto(
    UUID id,
    UUID restaurantId,
    Integer foodId,
    String foodName,
    String foodGroup,
    String foodSubgroup,
    Double quantity,
    String unit,
    Integer leadTime,
    Double alertLevel,
    Double reorderCount,
    String status,
    UUID productId
) {}
