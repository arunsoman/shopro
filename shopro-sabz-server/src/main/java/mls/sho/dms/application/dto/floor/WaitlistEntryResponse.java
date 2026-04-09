package mls.sho.dms.application.dto.floor;

import java.time.Instant;
import java.util.UUID;

public record WaitlistEntryResponse(
    UUID id,
    String guestName,
    int partySize,
    String guestPhone,
    Integer estimatedWaitMinutes,
    String status,
    Instant notifiedAt,
    UUID seatedAtTableId,
    String seatedAtTableName,
    String handledByName,
    Instant createdAt
) {}
