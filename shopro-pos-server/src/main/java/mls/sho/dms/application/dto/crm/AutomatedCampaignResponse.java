package mls.sho.dms.application.dto.crm;

import mls.sho.dms.entity.crm.TriggerEvent;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AutomatedCampaignResponse(
        UUID id,
        String name,
        TriggerEvent triggerEvent,
        int delayHours,
        UUID templateId,
        boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
