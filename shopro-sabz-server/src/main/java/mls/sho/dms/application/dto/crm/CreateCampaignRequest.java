package mls.sho.dms.application.dto.crm;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import mls.sho.dms.entity.crm.TriggerEvent;

import java.util.UUID;

public record CreateCampaignRequest(
        @NotBlank(message = "Campaign name is required")
        String name,
        @NotNull(message = "Trigger event is required")
        TriggerEvent triggerEvent,
        int delayHours,
        UUID templateId,
        Boolean isActive
) {}
