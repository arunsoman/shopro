package mls.sho.dms.application.dto.crm;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.util.UUID;

public record UpdateCustomerRequest(
    @NotBlank(message = "First name is required")
    String firstName,

    String lastName,

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Invalid phone number format")
    String phoneNumber,

    String email,
    String preferenceNotes,
    boolean smsOptIn,
    boolean emailOptIn
) {}
