package mls.sho.dms.application.dto.staff;

import java.util.List;
import java.util.UUID;

public record RoleResponse(
    UUID id,
    String name,
    String description,
    List<String> permissions,
    UUID parentRoleId
) {}
