package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.dto.PurchaseOrderDto;
import mls.sho.mplace.entity.PurchaseOrder;
import mls.sho.mplace.util.SecurityUtils;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BuyerDashboardService {

    private final OrderService orderService;
    private final InventoryService inventoryService;
    private final SecurityUtils securityUtils;

    public record BuyerStats(int activePos, int fulfilledMtd, int inventoryAlerts, int autoPoRules) {}
    public record Activity(String type, String title, String time, String status) {}

    public BuyerStats getStats() {
        var requester = securityUtils.getCurrentRequester();
        if (requester == null) return new BuyerStats(0,0,0,0);

        List<PurchaseOrderDto> orders = orderService.getAllOrders();
        int active = (int) orders.stream()
                .filter(o -> !o.status().equals("SHIPPED") && !o.status().equals("DELIVERED") && !o.status().equals("REJECTED"))
                .count();

        int alerts = inventoryService.getInventory().stream()
                .filter(i -> i.getHealth().equals("CRITICAL"))
                .toList().size();

        return new BuyerStats(active, 52, alerts, (int) inventoryService.getReorderRules().size());
    }

    public List<Activity> getRecentActivity() {
        List<PurchaseOrderDto> orders = orderService.getAllOrders();
        return orders.stream()
                .limit(5)
                .map(o -> new Activity("Order Update", "PO: " + o.referenceNumber(), "Recently", o.status()))
                .toList();
    }
}
