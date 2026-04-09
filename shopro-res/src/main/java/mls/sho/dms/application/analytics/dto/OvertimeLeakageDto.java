package mls.sho.dms.application.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OvertimeLeakageDto {
    private UUID staffId;
    private String staffName;
    private Double weeklyHours;
    private Integer standardHours;
    private Double overtimeHours;
    private BigDecimal overtimeCost;
}
