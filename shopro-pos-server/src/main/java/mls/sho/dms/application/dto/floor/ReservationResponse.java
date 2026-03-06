package mls.sho.dms.application.dto.floor;

import java.time.Instant;
import java.util.UUID;

public record ReservationResponse(
    UUID id,
    UUID tableId,
    String tableName,
    String guestName,
    int partySize,
    String guestPhone,
    Instant reservationStart,
    String status,
    String cancellationReason,
    String createdByName,
    Instant createdAt
) {}
