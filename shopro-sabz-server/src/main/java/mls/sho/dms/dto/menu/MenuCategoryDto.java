package mls.sho.dms.dto.menu;

import java.util.UUID;

public record MenuCategoryDto(
    UUID id,
    String name,
    String description,
    String photoUrl,
    Integer displayOrder,
    Integer defaultCourse
) {}
