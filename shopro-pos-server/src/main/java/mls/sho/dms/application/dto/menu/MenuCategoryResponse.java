package mls.sho.dms.application.dto.menu;

import java.util.UUID;

public record MenuCategoryResponse(
    UUID id,
    String name,
    Integer displayOrder
) {}
