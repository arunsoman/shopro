package mls.sho.dms.application.dto.crm;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record SegmentResponse(
        UUID id,
        String name,
        String description,
        boolean isActive,
        List<SegmentRuleDto> rules,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
