package mls.sho.mplace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AutoPOStatsDto {
    private int triggers24h;
    private double successRate;
    private String activeWorkers;
    private int failuresMTD;
    private String triggerTrend;
    private String failureTrend;
}
