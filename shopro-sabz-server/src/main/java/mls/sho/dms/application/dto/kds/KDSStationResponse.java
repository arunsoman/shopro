package mls.sho.dms.application.dto.kds;

import java.util.UUID;
import mls.sho.dms.entity.kds.KDSStationType;

public record KDSStationResponse(
    UUID id,
    String name,
    KDSStationType stationType,
    boolean online
) {}
