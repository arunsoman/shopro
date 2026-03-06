package mls.sho.dms.application.dto.inventory;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import mls.sho.dms.entity.inventory.WasteReason;

import java.math.BigDecimal;
import java.util.UUID;

public record LogWasteRequest(
    @NotNull(message = "Order item ID is mandatory if resolving an order waste, optional for direct ingredient waste")
    UUID orderItemId,

    UUID ingredientId, // Optional, used if logging waste directly for an ingredient rather than an order item

    @NotNull(message = "Waste reason is required.")
    WasteReason reason,

    @NotNull(message = "Quantity is required.")
    @DecimalMin(value = "0.0001", message = "Quantity must be greater than zero.")
    BigDecimal quantity,

    String notes,

    @NotNull(message = "Staff ID is required for audit.")
    UUID loggedById,

    UUID authorizedById // Used if a Manager PIN was required
) {}
