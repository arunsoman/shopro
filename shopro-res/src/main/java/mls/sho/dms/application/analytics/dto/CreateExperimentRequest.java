package mls.sho.dms.application.analytics.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import mls.sho.dms.common.enums.ExperimentType;
import mls.sho.dms.common.enums.ManagerRole;
import mls.sho.dms.entity.experiment.config.ExecutionConfig;
import mls.sho.dms.entity.experiment.config.RandomizationConfig;
import java.util.List;

@Data
public class CreateExperimentRequest {
    @NotBlank
    private String name;
    
    @NotNull
    private ExperimentType type;
    
    @NotNull
    private ManagerRole ownerRole;
    
    @NotNull
    private HypothesisDTO hypothesis;
    
    @Valid
    @Size(min = 2, max = 5)
    private List<VariantConfigDTO> variants;
    
    @NotNull
    private RandomizationConfig randomization;
    
    @NotNull
    private ExecutionConfig execution;
}
