package mls.sho.dms.application.dto.order;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import mls.sho.dms.entity.order.OrderType;

import java.util.UUID;

/**
 * Request to initialize a new order ticket.
 */
public record CreateOrderRequest(
    @NotNull(message = "Order type is required.")
    OrderType orderType,

    /** Optional for Takeaway/Delivery, required for Dine-in (validated in service). */
    UUID tableId,

    /** Optional customer reference. */
    UUID customerProfileId,

    /** Optional for Dine-in/Takeaway, required for Delivery (validated in service). */
    String deliveryAddress,

    @Min(value = 1, message = "Cover count must be at least 1.")
    int coverCount,

    /** Optional vehicle details for Curbside orders. */
    String vehicleModel,
    String vehicleColor,
    String vehiclePlate
) {}
