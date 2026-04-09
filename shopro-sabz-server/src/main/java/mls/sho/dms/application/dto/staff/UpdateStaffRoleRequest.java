package mls.sho.dms.application.dto.staff;

import jakarta.validation.constraints.NotBlank;

/** Request body for updating a staff member's role. */
public record UpdateStaffRoleRequest(
        @NotBlank String role
) {}
