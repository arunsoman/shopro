package mls.sho.dms.application.dto.menu;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateMenuCategoryRequest(
    @NotBlank(message = "Category name is required.")
    @Size(max = 40, message = "Category name must be 40 characters or fewer.")
    String name
) {}
