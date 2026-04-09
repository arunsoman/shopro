package mls.sho.dms.application.service.inventory;

import mls.sho.dms.application.dto.inventory.InventoryDashboardResponse;
import mls.sho.dms.application.service.inventory.dto.TvaReportRow;

import java.time.Instant;
import java.util.List;

public interface AnalyticsService {
    List<TvaReportRow> generateTvaReport(Instant startDate, Instant endDate);
    InventoryDashboardResponse getDashboardStats();
}
