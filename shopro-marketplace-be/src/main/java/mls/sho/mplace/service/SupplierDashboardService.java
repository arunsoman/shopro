package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.SubOrder;
import mls.sho.mplace.entity.Supplier;
import mls.sho.mplace.repository.SupplierRepository;
import mls.sho.mplace.util.SecurityUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierDashboardService {

    private final SupplierRepository supplierRepository;
    private final SupplierOrderService orderService;
    private final FinanceService financeService;
    private final SecurityUtils securityUtils;

    public record DashboardStats(
            String companyName,
            double monthlyRevenue,
            int activeOrders,
            double fulfillmentRate,
            int pendingQuotations,
            int quotesSent,
            int acksSent
    ) {}
    public record RecentActivity(String id, String event, String time, String type) {}

    public DashboardStats getStats(UUID supplierId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
        
        FinanceService.SupplierFinanceStats fStats = financeService.getSupplierStats(supplierId);
        List<SubOrder> orders = orderService.getOrdersForSupplier(supplierId);
        
        int active = (int) orders.stream()
                .filter(o -> o.getStatus() != SubOrder.SubOrderStatus.DELIVERED && o.getStatus() != SubOrder.SubOrderStatus.REJECTED)
                .count();

        int acks = (int) orders.stream()
                .filter(o -> o.getStatus() == SubOrder.SubOrderStatus.ACKNOWLEDGED || o.getStatus() == SubOrder.SubOrderStatus.DISPATCHED || o.getStatus() == SubOrder.SubOrderStatus.DELIVERED)
                .count();

        return new DashboardStats(
                supplier.getName(),
                fStats.totalRevenue(),
                active,
                98.4, // Still semi-mocked until detailed SLA logic is added
                0,    // TODO: Implement QuotationRepository count
                orders.size(),
                acks
        );
    }

    public List<RecentActivity> getActivity(UUID supplierId) {
        List<SubOrder> orders = orderService.getOrdersForSupplier(supplierId);
        
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
