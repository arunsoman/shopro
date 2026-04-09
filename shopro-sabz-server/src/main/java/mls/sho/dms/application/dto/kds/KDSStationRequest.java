package mls.sho.dms.application.dto.kds;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import mls.sho.dms.entity.kds.KDSStationType;

public record KDSStationRequest(
    @NotBlank(message = "Station name is required")
    String name,

    @NotNull(message = "Station type is required")
    KDSStationType stationType
) {}
