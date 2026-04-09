package mls.sho.dms.application.pos.web;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.pos.repository.RestaurantRepository;
import mls.sho.dms.application.pos.service.DiningTableService;
import mls.sho.dms.application.pos.service.OrderService;
import mls.sho.dms.application.pos.service.TableSessionService;
import mls.sho.dms.entity.DiningTable;
import mls.sho.dms.entity.Order;
import mls.sho.dms.entity.OrderLine;
import mls.sho.dms.entity.TableSession;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/pos")
@RequiredArgsConstructor
public class PosController {

    private final DiningTableService tableService;
    private final TableSessionService sessionService;
    private final OrderService orderService;
    private final RestaurantRepository repo;
    private final mls.sho.dms.application.pos.repository.MenuItemRepository menuItemRepository;

    // -- Tables & Sessions -------------------------------------

    @GetMapping("/menu-items")
    public List<mls.sho.dms.entity.MenuItem> getMenuItems(@PathVariable Long restaurantId) {
        return menuItemRepository.findAllByRestaurantId(restaurantId);
    }

    @GetMapping("/tables")
    public List<DiningTable> getTables(@PathVariable Long restaurantId) {
        return tableService.getAllTables(restaurantId);
    }

    @PatchMapping("/tables/{id}/status")
    public void updateTableStatus(@PathVariable Long restaurantId, @PathVariable Long id, @RequestParam DiningTable.TableStatus status) {
        tableService.updateStatus(id, status);
    }

    @GetMapping("/sessions/active")
    public List<TableSession> getActiveSessions(@PathVariable Long restaurantId) {
        return sessionService.getActiveSessions(restaurantId);
    }

    @PostMapping("/tables/{id}/open")
    public TableSession openTable(
            @PathVariable Long restaurantId,
            @PathVariable Long id,
            @RequestParam int guests,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime openedAt) {
        var tt = repo.findById(restaurantId).get();
        return sessionService.openSession(tt, id, guests, openedAt);
    }

    @PatchMapping("/sessions/{id}/guests")
    public void updateGuestCount(@PathVariable Long restaurantId, @PathVariable Long id, @RequestParam int guests) {
        sessionService.updateGuestCount(id, guests);
    }

    @PostMapping("/sessions/{id}/close")
    public void closeSession(
            @PathVariable Long restaurantId,
            @PathVariable Long id,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime closedAt) {
        sessionService.closeSession(id, closedAt);
    }

    // -- Orders -----------------------------------------------

    @PostMapping("/orders")
    public Order placeOrder(
            @PathVariable Long restaurantId, 
            @RequestBody Order order,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime createdAt) {
        if (createdAt != null) order.setCreatedAt(createdAt);
        return orderService.placeOrder(order);
    }

    @PatchMapping("/orders/{id}/status")
    public void updateOrderStatus(
            @PathVariable Long restaurantId, 
            @PathVariable Long id, 
            @RequestParam Order.OrderStatus status,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime updatedAt) {
        orderService.updateStatus(id, status);
        // Note: Currently Order doesn't have a specific updatedAt for payments, 
        // but we can add it later if the simulation demands financial audit trail precision.
    }

    @PatchMapping("/orders/{id}/void")
    public void voidOrder(@PathVariable Long restaurantId, @PathVariable Long id, @RequestParam String reason) {
        orderService.voidOrder(id, reason);
    }

    @PostMapping("/orders/{id}/items")
    public void addItemsToOrder(@PathVariable Long restaurantId, @PathVariable Long id, @RequestBody List<OrderLine> items) {
        orderService.addItems(id, items);
    }
}
