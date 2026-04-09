package mls.sho.dms.application.analytics.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ManagerDashboardSnapshotDto {
    private String role; // GM, CHEF, FOH, BAR, SHIFT, CATERING
    private Object data; // Role-specific DTO (GmDashboardDto, etc.)
}
