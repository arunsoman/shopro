package mls.sho.dms.application.dto.menu;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class ModifierGroupDTOs {

    public record ModifierOptionResponse(
        UUID id,
        String label,
        BigDecimal upchargeAmount,
        int displayOrder
    ) {}

    public record ModifierGroupResponse(
        UUID id,
        String name,
        boolean required,
        int minSelections,
        int maxSelections,
        List<ModifierOptionResponse> options
    ) {}

    public record CreateModifierOptionRequest(
        @NotBlank(message = "Option label is required")
        @Size(max = 80, message = "Label must be 80 characters or fewer")
        String label,

        @NotNull(message = "Upcharge amount is required")
        @DecimalMin(value = "0.00", message = "Upcharge amount cannot be negative")
        BigDecimal upchargeAmount,

        @Min(value = 0, message = "Display order cannot be negative")
        int displayOrder
    ) {}

    public record CreateModifierGroupRequest(
        @NotBlank(message = "Group name is required")
        @Size(max = 80, message = "Name must be 80 characters or fewer")
        String name,

        boolean required,

        @Min(value = 0, message = "Minimum selections cannot be negative")
        int minSelections,

        @Min(value = 1, message = "Maximum selections must be at least 1")
        int maxSelections,

        @Valid
        @NotNull(message = "Options list cannot be null")
        @Size(min = 1, message = "At least one option is required")
        List<CreateModifierOptionRequest> options
    ) {}
}
