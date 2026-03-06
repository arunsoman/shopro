package mls.sho.dms.application.dto.kds;

import java.util.List;
import java.util.UUID;
import mls.sho.dms.entity.kds.KDSItemStatus;

public record KDSTicketItemResponse(
    UUID id,
    UUID menuItemId,
    String name,
    Integer quantity,
    KDSItemStatus status,
    String customNote,
    List<String> modifiers
) {}
