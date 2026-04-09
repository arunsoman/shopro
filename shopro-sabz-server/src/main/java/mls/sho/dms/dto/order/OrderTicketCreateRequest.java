package mls.sho.dms.dto.order;

import mls.sho.dms.entity.order.OrderType;

import java.util.List;
import java.util.UUID;

public record OrderTicketCreateRequest(
    UUID tableId,
    UUID serverId,
    OrderType orderType,
    UUID customerProfileId,
    String deliveryAddress,
    Integer coverCount,
    List<OrderItemCreateRequest> items
) {
    public record OrderItemCreateRequest(
        UUID menuItemId,
        int quantity,
        String customNote,
        boolean hasAllergyFlag,
        boolean isSubtraction,
        List<UUID> modifierOptionIds
    ) {}
}
