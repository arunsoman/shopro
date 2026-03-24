package mls.sho.mplace.dto;

import java.util.UUID;

/**
 * Request DTO for updating inventory settings (lead time, alert level, reorder count).
 */
public record InventorySettingsRequest(
    Integer leadTime,
    Double alertLevel,
    Double reorderCount
) {}
