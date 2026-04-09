package mls.sho.dms.web.controller.crm;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.crm.CrmDashboardStatsResponse;
import mls.sho.dms.application.dto.crm.CustomerProfileResponse;
import mls.sho.dms.application.service.crm.CrmAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/crm/analytics")
@RequiredArgsConstructor
public class CrmAnalyticsController {

    private final CrmAnalyticsService analyticsService;

    @GetMapping("/dashboard-stats")
    public ResponseEntity<CrmDashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(analyticsService.getDashboardStats());
    }

    @GetMapping("/at-risk")
    public ResponseEntity<List<CustomerProfileResponse>> getAtRiskCustomers() {
        return ResponseEntity.ok(analyticsService.getAtRiskCustomers());
    }
}
