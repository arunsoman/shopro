package mls.sho.dms.application.dto.menu;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record MenuItemResponse(
    UUID id,
    String name,
    String description,
    BigDecimal basePrice,
    UUID categoryId,
    String categoryName,
    String status,
    String photoUrl,
    String createdAt,
    String updatedAt,
    List<ModifierGroupResponse> modifierGroups
) {
    public record ModifierGroupResponse(
        UUID id,
        String name,
        boolean required,
        int minSelections,
        int maxSelections,
        List<ModifierOptionResponse> options
    ) {}

    public record ModifierOptionResponse(
        UUID id,
        String label,
        BigDecimal upchargeAmount
    ) {}
}
