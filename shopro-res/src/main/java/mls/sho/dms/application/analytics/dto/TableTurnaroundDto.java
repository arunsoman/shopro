package mls.sho.dms.application.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableTurnaroundDto {
    private Long tableId;
    private String tableName;
    private Long totalSessions;
    private Double avgTurnaroundMinutes;
    private BigDecimal avgRevenuePerSession;
    private Double turnoverRate;
    private Double intensity;
}
