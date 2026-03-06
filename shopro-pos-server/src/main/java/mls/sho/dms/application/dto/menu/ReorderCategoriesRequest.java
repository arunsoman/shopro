package mls.sho.dms.application.dto.menu;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public record ReorderCategoriesRequest(
    @NotEmpty(message = "Category ID list cannot be empty.")
    List<@NotNull UUID> categoryIds
) {}
