package mls.sho.dms.entity.experiment.config;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class Hypothesis {
    private UUID id;
    private String name;
    private String description;
    private String controlGroup;
    private String treatmentGroup;
    private String targetAudience;
    private Integer expectedValue;
    private BigDecimal confidenceLevel;
}
