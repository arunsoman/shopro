package mls.sho.dms.application.dto.crm;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrmDashboardStatsResponse {
    private double avgClv;
    private long activeMembers;
    private long newEnrollments;
    private BigDecimal totalPointsLiability;
    private double redemptionRate;
}
