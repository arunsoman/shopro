package mls.sho.dms.application.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LaborAnalyticsDto {
    private LocalDate date;
    private BigDecimal laborCost;
    private Long laborMinutes;
    private Double laborPercentage; // Labor cost as % of revenue
    private Double intensity; // 0.0 to 1.0 based on relative cost volume
}
