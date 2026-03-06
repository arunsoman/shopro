package mls.sho.dms.application.dto.inventory;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

public record CreateSupplierRequest(
    @NotBlank(message = "Company name is required")
    String companyName,

    @NotBlank(message = "Contact name is required")
    String contactName,

    @Email(message = "Valid email is required")
    @NotBlank(message = "Contact email is required")
    String contactEmail,

    String contactPhone,

    @PositiveOrZero(message = "Lead time must be 0 or greater")
    int leadTimeDays
) {}
