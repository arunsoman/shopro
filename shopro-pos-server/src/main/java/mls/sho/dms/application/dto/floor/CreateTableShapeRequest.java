package mls.sho.dms.application.dto.floor;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.util.UUID;

public record CreateTableShapeRequest(
    @NotNull(message = "Section ID is required.")
    UUID sectionId,

    @NotBlank(message = "Table name is required.")
    @Pattern(regexp = "^[a-zA-Z0-9\\-]+$", message = "Table name can only contain letters, numbers, and hyphens.")
    String name,

    @Min(value = 1, message = "Capacity must be at least 1.")
    @Max(value = 50, message = "Capacity cannot exceed 50.")
    int capacity,

    @Min(value = 0, message = "X position cannot be negative.")
    int posX,

    @Min(value = 0, message = "Y position cannot be negative.")
    int posY,

    @Min(value = 10, message = "Width must be at least 10.")
    int width,

    @Min(value = 10, message = "Height must be at least 10.")
    int height,
    
    @NotBlank(message = "Shape type is required.")
    @Pattern(regexp = "^(RECTANGLE|CIRCLE)$", message = "Shape type must be RECTANGLE or CIRCLE.")
    String shapeType
) {}
