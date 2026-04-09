package mls.sho.dms.application.analytics.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ChefDashboardDto {
    private BigDecimal foodCostPctActual;
    private BigDecimal foodCostPctTheoretical;
    private Double batchYieldAccuracyPct;
    private Integer avgTicketTimeMins;
    private Integer haccpAlertCount;
    private Double prepListCompletionPct;
    private List<ManagerCommonDtos.ItemStockDto> lowPrepItems;
}
