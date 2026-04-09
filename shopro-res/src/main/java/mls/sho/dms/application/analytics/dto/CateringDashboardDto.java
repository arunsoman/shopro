package mls.sho.dms.application.analytics.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CateringDashboardDto {
    private Integer upcomingEventsCount;
    private BigDecimal totalEventRevenue;
    private Double beoAccuracyPct;
    private List<ManagerCommonDtos.EventSummaryDto> activeEvents;
    private Integer equipmentOutCount;
}
