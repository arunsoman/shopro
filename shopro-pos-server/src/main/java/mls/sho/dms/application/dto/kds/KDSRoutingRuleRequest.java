package mls.sho.dms.application.dto.kds;

import jakarta.validation.constraints.NotNull;
import mls.sho.dms.entity.kds.RoutingTargetType;
import java.util.UUID;

public record KDSRoutingRuleRequest(
    @NotNull(message = "Station ID is required")
    UUID stationId,

    @NotNull(message = "Target type is required")
    RoutingTargetType targetType,

    @NotNull(message = "Target ID is required")
    UUID targetId
) {}
