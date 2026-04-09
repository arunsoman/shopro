package mls.sho.dms.application.analytics.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class BarDashboardDto {
    private BigDecimal pourCostPct;
    private BigDecimal theoreticalPourCostPct;
    private BigDecimal deadStockValue;
    private BigDecimal spoilageValue;
    private List<ManagerCommonDtos.ItemStockDto> lowStockDrafts;
}
