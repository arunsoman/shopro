package mls.sho.dms.application.service.crm;

import mls.sho.dms.application.dto.crm.CrmDashboardStatsResponse;
import mls.sho.dms.application.dto.crm.CustomerProfileResponse;
import java.util.List;

public interface CrmAnalyticsService {
    CrmDashboardStatsResponse getDashboardStats();
    List<CustomerProfileResponse> getAtRiskCustomers();
}
