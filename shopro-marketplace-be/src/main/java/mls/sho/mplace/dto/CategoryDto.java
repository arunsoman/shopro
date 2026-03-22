package mls.sho.mplace.dto;

import java.util.UUID;

public record CategoryDto(
    UUID id,
    String name,
    String icon,
    UUID parentId,
    int subCategoryCount
) {}
