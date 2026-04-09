package mls.sho.dms.application.analytics.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class HypothesisDTO {
    private String description;
    private String targetAudience;
    private Integer expectedValue;
    private BigDecimal confidenceLevel;
}
