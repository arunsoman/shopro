package mls.sho.dms.application.dto.kds;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import mls.sho.dms.entity.kds.KDSTicketStatus;

public record KDSTicketResponse(
    UUID id,
    String tableNumber,
    String serverName,
    KDSTicketStatus status,
    Instant firedAt,
    List<KDSTicketItemResponse> items
) {}
