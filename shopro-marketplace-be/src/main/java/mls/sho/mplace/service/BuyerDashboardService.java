package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.dto.PurchaseOrderDto;
import mls.sho.mplace.entity.PurchaseOrder;
import mls.sho.mplace.util.SecurityUtils;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class BuyerDashboardService {

    private final OrderService orderService;
    private final InventoryService inventoryService;
    private final SecurityUtils securityUtils;

    public record BuyerStats(int activePos, int fulfilledMtd, int inventoryAlerts, int autoPoRules, int inventorySyncPercentage, int criticalDiscrepancies) {}
    public record Activity(String type, String title, String time, String status) {}

    public BuyerStats getStats() {
        log.info("Fetching stats for current user");
        var requester = securityUtils.getCurrentRequester();
        if (requester == null) {
            log.warn("No requester found, returning default stats");
            return new BuyerStats(0,0,0,0, 100, 0);
        }
        log.info("Requester: {}, Restaurant: {}", requester.email(), requester.restaurantId());

        log.info("Fetching all orders");
        List<PurchaseOrderDto> orders = orderService.getAllOrders();
        log.info("Found {} orders", orders.size());

        int active = (int) orders.stream()
                .filter(o -> {
                    boolean isActive = !o.status().equals("SHIPPED") && !o.status().equals("DELIVERED") && !o.status().equals("REJECTED");
                    return isActive;
                })
                .count();
        log.info("Active orders: {}", active);

        int fulfilled = (int) orders.stream()
                .filter(o -> {
                    if (o.raisedAt() == null) return false;
                    boolean isDateMatch = (o.status().equals("SHIPPED") || o.status().equals("DELIVERED")) && 
                            o.raisedAt().isAfter(java.time.LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0));
                    return isDateMatch;
                })
                .count();
        log.info("Fulfilled MTD: {}", fulfilled);

        log.info("Fetching food inventory for restaurant {}", requester.restaurantId());
        var inventory = inventoryService.getFoodInventory(requester.restaurantId());
        log.info("Found {} inventory items", inventory.size());

        int alerts = (int) inventory.stream()
                .filter(i -> i.quantity() <= i.alertLevel())
                .count();
        log.info("Inventory alerts: {}", alerts);

        int totalItems = inventory.size();
        int syncPercentage = totalItems > 0 ? (int) (((double)(totalItems - alerts) / totalItems) * 100) : 100;

        int reorderRules = (int) inventoryService.getReorderRules().size();
        log.info("Reorder rules: {}", reorderRules);

        return new BuyerStats(active, fulfilled, alerts, reorderRules, syncPercentage, alerts);
    }

    public List<Activity> getRecentActivity() {
        List<PurchaseOrderDto> orders = orderService.getAllOrders();
        return orders.stream()
                .limit(5)
                .map(o -> new Activity("Order Update", "PO: " + o.referenceNumber(), "Recently", o.displayStatus() != null ? o.displayStatus() : o.status()))
                .toList();
    }
}
