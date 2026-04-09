package mls.sho.dms.entity.experiment.config;

import lombok.Data;
import java.util.List;

@Data
public class RandomizationConfig {
    private String strategy; // TIME_BASED, TABLE_BASED, CUSTOMER_ID, STATION_ROTATION
    private List<TimeBlock> timeBlocks;
    private List<String> exclusions;

    @Data
    public static class TimeBlock {
        private List<String> days; // ["MON", "TUE"]
        private String variantKey;
    }
}
