package mls.sho.dms.application.dto.staff;

import java.util.List;
import java.util.UUID;

public record RoleRequest(
    String name,
    String description,
    List<String> permissions,
    UUID parentRoleId
) {}
