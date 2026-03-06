package mls.sho.dms.application.dto.floor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateSectionRequest(
    @NotBlank(message = "Section name is required.")
    @Size(max = 80, message = "Section name must be 80 characters or fewer.")
    String name
) {}
