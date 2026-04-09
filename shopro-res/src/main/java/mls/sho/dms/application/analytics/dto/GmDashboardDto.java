package mls.sho.dms.application.analytics.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class GmDashboardDto {
    private BigDecimal totalRevenue;
    private BigDecimal netProfit;
    private BigDecimal laborProductivity; // Rev/Labor Hr
    private Double npsScore;
    private Integer avgTableTurnMins;
    private Double staffRetentionPct;
    private List<ManagerCommonDtos.AnomalyDto> alerts;
    private Integer unresolvedComplaintsCount;
}
