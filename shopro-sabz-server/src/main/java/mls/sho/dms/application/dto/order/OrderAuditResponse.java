package mls.sho.dms.application.dto.order;

import java.time.Instant;
import java.util.UUID;

public record OrderAuditResponse(
    UUID id,
    String eventType,
    String details,
    String performedBy,
    Instant createdAt
) {}
