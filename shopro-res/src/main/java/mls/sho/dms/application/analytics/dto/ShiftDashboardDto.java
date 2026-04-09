package mls.sho.dms.application.analytics.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ShiftDashboardDto {
    private BigDecimal currentSales;
    private BigDecimal salesProjection;
    private Integer activeStaffCount;
    private Integer approachingOtStaffCount;
    private Integer ticketsAgingOver20Mins;
    private String weatherSummary;
}
