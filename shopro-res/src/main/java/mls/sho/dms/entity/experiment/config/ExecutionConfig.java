package mls.sho.dms.entity.experiment.config;

import lombok.Data;
import mls.sho.dms.common.enums.RandomizationUnit;
import java.time.LocalDate;
import java.util.List;

@Data
public class ExecutionConfig {
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer durationDays;
    private Integer minDurationDays = 14; // Default to 14 days
    private Integer minSampleSize;
    private AutoRollback autoRollback = new AutoRollback();
    private List<String> integrations;
    private String primaryMetric;
    private Double haltThreshold;
    private RandomizationUnit randomizationUnit = RandomizationUnit.GUEST;

    @Data
    public static class AutoRollback {
        private boolean enabled = true;
        private List<String> triggerConditions; // ["complaint_rate > 0.03", "p_value > 0.1"]
    }
}
