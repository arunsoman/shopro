package mls.sho.dms.application.analytics.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class ExperimentResultsDTO {
    private BigDecimal primaryLift;
    private BigDecimal confidence;
    private Integer sampleSize;
    private BigDecimal controlValue;
    private BigDecimal treatmentValue;
    private Double progressPercentage;
    private String statusMessage;
    private boolean isSignificant;
    private String noveltyWarning;
    private boolean minDurationMet;
}
