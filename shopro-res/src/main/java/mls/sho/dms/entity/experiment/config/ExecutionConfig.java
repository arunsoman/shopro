package mls.sho.dms.entity.experiment.config;

import lombok.Data;

@Data
public class ExecutionConfig {
    private String startDate;
    private String endDate;
    private int sampleSize;
    private double significanceLevel;
    private Integer durationDays;
    private AutoRollback autoRollback;
    private String primaryMetric;
    private Integer minDurationDays;

    @Data
    public static class AutoRollback {
        private boolean enabled;
        private java.util.List<String> triggerConditions;
    }
}
