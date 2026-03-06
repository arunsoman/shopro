package mls.sho.dms.application.dto.staff;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Request body for creating a new staff member.
 * PIN is accepted in plain text and hashed server-side before storage.
 */
public record CreateStaffRequest(
        @NotBlank @Size(max = 120) String fullName,

        /** Plain-text 4-digit PIN — hashed by the service layer, never stored raw. */
        @NotBlank @Pattern(regexp = "\\d{4}", message = "PIN must be exactly 4 digits") String pin,

        @NotBlank String role
) {}
