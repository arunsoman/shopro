package mls.sho.dms.application.pos.web;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.pos.dto.*;
import mls.sho.dms.application.pos.repository.RestaurantRepository;
import mls.sho.dms.application.pos.service.DiningTableService;
import mls.sho.dms.application.pos.service.OrderService;
import mls.sho.dms.application.pos.service.TableSessionService;
import mls.sho.dms.application.inventory.service.InventoryIntelligenceService;
import mls.sho.dms.entity.DiningTable;
import mls.sho.dms.entity.Order;
import mls.sho.dms.entity.OrderLine;
import mls.sho.dms.entity.TableSession;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/pos")
@RequiredArgsConstructor
public class PosController {

    private final DiningTableService tableService;
    private final TableSessionService sessionService;
    private final OrderService orderService;
    private final RestaurantRepository repo;
    private final mls.sho.dms.application.pos.repository.MenuItemRepository menuItemRepository;
    private final InventoryIntelligenceService inventoryIntelligence;
    // -- Tables & Sessions -------------------------------------

    @GetMapping("/menu-items")
    public List<MenuItemDto> getMenuItems(@PathVariable Long restaurantId) {
        return menuItemRepository.findAllByRestaurantId(restaurantId).stream()
                .map(this::mapToMenuItemDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/tables")
    public List<DiningTableDto> getTables(@PathVariable Long restaurantId) {
        return tableService.getAllTables(restaurantId).stream()
                .map(this::mapToDiningTableDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/tables/available/{guests}")
    public List<DiningTableDto> getAvailableTables(@PathVariable Long restaurantId, @PathVariable int guests    ) {
        return tableService.getAvailableTables(restaurantId, guests).stream()
                .map(this::mapToDiningTableDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/sessions/active")
    public List<TableSessionDto> getActiveSessions(@PathVariable Long restaurantId) {
        return sessionService.getActiveSessions(restaurantId).stream()
                .map(this::mapToTableSessionDto)
                .collect(Collectors.toList());
    }

    @PostMapping("/tables/{id}/open")
    public TableSessionDto occupyTable(
            @PathVariable Long restaurantId,
            @PathVariable Long id,
            @RequestParam int guests,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime openedAt) {
        var tt = repo.findById(restaurantId).orElseThrow();
        TableSession session = sessionService.openSession(tt, id, guests, openedAt);
        return mapToTableSessionDto(session);
    }

    @PatchMapping("/tables/{id}/vacate")
    public void vacateTable(@PathVariable Long restaurantId, @PathVariable Long id) {
        tableService.updateStatus(id, DiningTable.TableStatus.DIRTY);
    }

    @PatchMapping("/tables/{id}/clean")
    public void cleanTable(@PathVariable Long restaurantId, @PathVariable Long id) {
        tableService.updateStatus(id, DiningTable.TableStatus.AVAILABLE);
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
    public OrderDto placeOrder(
            @PathVariable Long restaurantId, 
            @RequestBody OrderCreateDto dto,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime createdAt) {
        if (createdAt != null) dto.setCreatedAt(createdAt);
        Order savedOrder = orderService.placeOrder(dto, restaurantId);
        return mapToOrderDto(savedOrder);
    }

    @GetMapping("/orders/{id}/status")
    public Order.OrderStatus getOrderStatus(
            @PathVariable Long restaurantId, 
            @PathVariable Long id) {
        return orderService.getOrderStatus(id);
    }

    @PatchMapping("/orders/{id}/void")
    public void voidOrder(@PathVariable Long restaurantId, @PathVariable Long id,
         @RequestParam String reason) {
        orderService.voidOrder(id, reason);
    }

    @PostMapping("/orders/{id}/items")
    public void addItemsToOrder(@PathVariable Long restaurantId, @PathVariable Long id, 
        @RequestBody List<OrderLineDto> items) {
        orderService.addItems(id, items);
    }
    
    @PatchMapping("/tables/{tableId}/pay/{orderId}")
    public void payOrder(@PathVariable Long restaurantId, @PathVariable Long tableId,
         @PathVariable Long orderId) {
            Order order = orderService.completeOrder(orderId);
        inventoryIntelligence.orderFulfillment(order);
        tableService.updateStatus(tableId, DiningTable.TableStatus.DIRTY);
    }
    // -- Mappers (Private) ------------------------------------

    private MenuItemDto mapToMenuItemDto(mls.sho.dms.entity.MenuItem item) {
        MenuItemDto dto = new MenuItemDto();
        dto.setId(item.getId());
        dto.setPosId(item.getPosId());
        dto.setName(item.getName());
        dto.setSellPrice(item.getSellPriceBuffer());
        dto.setActive(item.isActive());
        dto.setDisplayOrder(item.getDisplayOrder());
        dto.setCreatedAt(item.getCreatedAt());
        return dto;
    }

    private DiningTableDto mapToDiningTableDto(DiningTable table) {
        DiningTableDto dto = new DiningTableDto();
        dto.setId(table.getId());
        dto.setTableNumber(table.getTableNumber());
        dto.setCapacity(table.getCapacity());
        dto.setStatus(table.getStatus().name());
        dto.setPosX(table.getPosX());
        dto.setPosY(table.getPosY());
        return dto;
    }

    private TableSessionDto mapToTableSessionDto(TableSession session) {
        TableSessionDto dto = new TableSessionDto();
        dto.setId(session.getId());
        dto.setTableId(session.getTable().getId());
        dto.setGuestCount(session.getGuestCount());
        dto.setOpenedAt(session.getOpenedAt());
        dto.setClosedAt(session.getClosedAt());
        dto.setServerName(session.getServerName());
        dto.setServerRole(session.getServerRole());
        return dto;
    }

    private OrderDto mapToOrderDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setSessionId(order.getSessionId());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus().name());
        dto.setCreatedAt(order.getCreatedAt());
        if (order.getLines() != null) {
            dto.setLines(order.getLines().stream().map(this::mapToOrderLineDto).collect(Collectors.toList()));
        }
        return dto;
    }

    private OrderLineDto mapToOrderLineDto(OrderLine line) {
        OrderLineDto dto = new OrderLineDto();
        dto.setId(line.getId());
        dto.setMenuItemId(line.getMenuItem().getId());
        dto.setQuantity(line.getQuantity());
        dto.setUnitPrice(line.getUnitPrice());
        dto.setSubtotal(line.getSubtotal());
        return dto;
    }
}

