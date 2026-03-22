package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.MarketplaceSupplier;
import mls.sho.mplace.entity.SubOrder;
import mls.sho.mplace.util.SecurityUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierDashboardService {

    private final SupplierOrderService orderService;
    private final FinanceService financeService;
    private final SecurityUtils securityUtils;

    public record DashboardStats(double monthlyRevenue, int activeOrders, double fulfillmentRate, int pendingQuotations) {}
    public record RecentActivity(String id, String event, String time, String type) {}

    public DashboardStats getStats(MarketplaceSupplier supplier) {
        FinanceService.SupplierFinanceStats fStats = financeService.getSupplierStats();
        List<SubOrder> orders = orderService.getOrdersForSupplier(supplier);
        
        int active = (int) orders.stream()
                .filter(o -> o.getStatus() != SubOrder.SubOrderStatus.DELIVERED && o.getStatus() != SubOrder.SubOrderStatus.REJECTED)
                .count();

        return new DashboardStats(
                fStats.totalRevenue(),
                active,
                98.4, // Mock rate for now
                3     // Mock pending quotes for now
        );
    }

    public List<RecentActivity> getActivity(MarketplaceSupplier supplier) {
        List<SubOrder> orders = orderService.getOrdersForSupplier(supplier);
        
        return orders.stream()
                .limit(5)
                .map(o -> new RecentActivity(
                        "ACT-" + o.getId().toString().substring(0,4),
                        "Order Update: #" + o.getId().toString().substring(0,8) + " is " + o.getStatus(),
                        "Recently",
                        "ORDER"
                ))
                .collect(Collectors.toList());
    }
}
