package mls.sho.dms.application.dto.staff;

import java.util.UUID;

public record PermissionResponse(
    UUID id,
    String name,
    String description,
    String category
) {}
