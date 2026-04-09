package mls.sho.dms.application.dto.inventory;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class InventoryDashboardResponse {
    private long activePOsCount;
    private BigDecimal totalInventoryValue;
    private BigDecimal monthlyWasteAmount;
    private double wastePercentageOfSales; // Optional enrichment
}
