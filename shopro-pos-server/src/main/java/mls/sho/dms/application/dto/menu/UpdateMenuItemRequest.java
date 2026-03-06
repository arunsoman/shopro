package mls.sho.dms.application.dto.menu;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public record UpdateMenuItemRequest(
    @NotBlank(message = "Name is required.")
    @Size(max = 60, message = "Name must be 60 characters or fewer.")
    String name,

    @Size(max = 500, message = "Description must be 500 characters or fewer.")
    String description,

    @NotNull(message = "Base price is required.")
    @DecimalMin(value = "0.00", message = "Base price must be $0.00 or greater.")
    @Digits(integer = 8, fraction = 2, message = "Price format invalid.")
    BigDecimal basePrice,

    @NotNull(message = "Category is required.")
    UUID categoryId,

    String photoUrl
) {}
