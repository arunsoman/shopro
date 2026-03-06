package mls.sho.dms.application.dto.auth;

import java.util.UUID;

/**
 * Returned by the login endpoint to identify the authenticated staff member.
 * This is a lightweight session token for POS use — not a JWT.
 * Clients store this in memory/localStorage for subsequent role-based routing.
 */
public record StaffSessionResponse(
    UUID id,
    String fullName,
    String role
) {}
