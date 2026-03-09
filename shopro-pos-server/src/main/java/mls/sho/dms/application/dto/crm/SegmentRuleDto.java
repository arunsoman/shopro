package mls.sho.dms.application.dto.crm;

import mls.sho.dms.entity.crm.SegmentField;
import mls.sho.dms.entity.crm.SegmentOperator;

import java.util.UUID;

public record SegmentRuleDto(
        UUID id,
        SegmentField field,
        SegmentOperator operator,
        String ruleValue
) {}
