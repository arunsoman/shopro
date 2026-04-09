package mls.sho.dms.application.analytics.dto;

import lombok.Data;
import java.util.List;

@Data
public class FohDashboardDto {
    private List<ManagerCommonDtos.TableStatusDto> tableStatuses;
    private List<ManagerCommonDtos.ServerMetricDto> serverPerformance;
    private Integer currentWaitMins;
    private Double waitAbandonmentRate;
    private Integer unresolvedComplaintsCount;
}
