package mls.sho.dms.application.dto.crm;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record MergeProfilesRequest(
    @NotNull(message = "Source profile ID is required")
    UUID sourceProfileId,

    @NotNull(message = "Target profile ID is required")
    UUID targetProfileId
) {}
