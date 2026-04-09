package mls.sho.dms.entity.experiment.config;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class Hypothesis {
    @JsonAlias("statement")
    private String description;
    private String targetAudience;
    private Integer expectedValue;
    private String successCriteria;
    private BigDecimal minimumDetectableEffect;
    private BigDecimal confidenceLevel = new BigDecimal("0.95");
}
