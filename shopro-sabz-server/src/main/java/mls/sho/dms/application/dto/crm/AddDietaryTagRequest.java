package mls.sho.dms.application.dto.crm;

import jakarta.validation.constraints.NotNull;
import mls.sho.dms.entity.crm.DietaryTagType;

public record AddDietaryTagRequest(
    @NotNull(message = "Tag type is required")
    DietaryTagType tagType,
    
    String customDescription
) {}
