package mls.sho.dms.application.analytics.dto;

import lombok.Data;
import mls.sho.dms.common.enums.ExperimentStatus;
import mls.sho.dms.common.enums.ExperimentType;
import mls.sho.dms.common.enums.ManagerRole;
import mls.sho.dms.entity.experiment.config.ExecutionConfig;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class ExperimentDTO {
    private UUID id;
    private String experimentKey;
    private String name;
    private ExperimentType type;
    private ExperimentStatus status;
    private ManagerRole ownerRole;
    private HypothesisDTO hypothesis;
    private List<VariantDTO> variants;
    private ExecutionConfig executionConfig;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private ExperimentResultsDTO results;
}
