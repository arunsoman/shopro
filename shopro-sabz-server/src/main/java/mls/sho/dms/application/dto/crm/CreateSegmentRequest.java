package mls.sho.dms.application.dto.crm;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record CreateSegmentRequest(
        @NotBlank(message = "Segment name is required")
        String name,
        String description,
        @NotEmpty(message = "At least one rule is required")
        List<SegmentRuleDto> rules
) {}
