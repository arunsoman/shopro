package mls.sho.dms.application.dto.staff;

import java.time.Instant;
import java.util.UUID;

/**
 * Public-safe representation of a staff member.
 * PIN hash is deliberately excluded.
 */
public record StaffMemberResponse(
        UUID id,
        String fullName,
        String role,
        java.util.List<String> permissions,
        boolean active,
        java.time.Instant lastLoginAt,
        java.time.Instant createdAt
) {}
