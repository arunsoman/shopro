package mls.sho.dms.dto.menu;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record MenuItemDto(
    UUID id,
    String name,
    String description,
    BigDecimal basePrice,
    String photoUrl,
    String status,
    UUID categoryId,
    List<Object> modifierGroups // Simplified for now
) {}
