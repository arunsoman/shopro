package mls.sho.dms.application.dto.order;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

/**
 * Request to add a line item to an existing order.
 */
public record AddOrderItemRequest(
    @NotNull(message = "Menu item is required.")
    UUID menuItemId,

    @Min(value = 1, message = "Quantity must be at least 1.")
    int quantity,

    /** List of modifier option IDs to apply. */
    List<UUID> modifierOptionIds,

    String customNote,
    boolean hasAllergyFlag,
    Integer courseNumber
) {}
