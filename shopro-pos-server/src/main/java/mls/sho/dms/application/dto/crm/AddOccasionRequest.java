package mls.sho.dms.application.dto.crm;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import mls.sho.dms.entity.crm.OccasionType;

public record AddOccasionRequest(
    @NotNull(message = "Occasion type is required")
    OccasionType occasionType,

    @Min(value = 1, message = "Month must be between 1 and 12")
    @Max(value = 12, message = "Month must be between 1 and 12")
    int occasionMonth,

    @Min(value = 1, message = "Day must be between 1 and 31")
    @Max(value = 31, message = "Day must be between 1 and 31")
    int occasionDay,

    Integer occasionYear
) {}
