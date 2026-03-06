package mls.sho.dms.application.dto.kds;

import mls.sho.dms.entity.kds.RoutingTargetType;
import java.util.UUID;

public record KDSRoutingRuleResponse(
    UUID id,
    UUID stationId,
    String stationName,
    RoutingTargetType targetType,
    UUID targetId,
    String targetName
) {}
