package mls.sho.dms.application.pos.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.pos.dto.OrderCreateDto;
import mls.sho.dms.application.pos.dto.OrderLineDto;
import mls.sho.dms.application.pos.repository.MenuItemRepository;
import mls.sho.dms.application.pos.repository.OrderRepository;
import mls.sho.dms.application.pos.repository.RestaurantRepository;
import mls.sho.dms.application.pos.repository.TableSessionRepository;
import mls.sho.dms.entity.MenuItem;
import mls.sho.dms.entity.Order;
import mls.sho.dms.entity.OrderLine;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository repository;
    private final TableSessionRepository sessionRepository;
    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final mls.sho.dms.application.analytics.service.ExperimentService experimentService;
    private final mls.sho.dms.application.inventory.service.InventoryIntelligenceService inventoryService;

    @Transactional
    public Order placeOrder(OrderCreateDto dto, Long restaurantId) {
        Order order = new Order();
        order.setRestaurantId(restaurantId);
        order.setRestaurant(restaurantRepository.findById(restaurantId).orElseThrow());
        order.setSessionId(dto.getSessionId());
        order.setOrderNumber(dto.getOrderNumber());
        if (dto.getCreatedAt() != null) order.setCreatedAt(dto.getCreatedAt());
        
        // Ensure session is attached
        if (dto.getSessionId() != null) {
            order.setSession(sessionRepository.findById(dto.getSessionId()).orElseThrow());
        }
        
        if (dto.getLines() != null) {
            for (OrderLineDto lineDto : dto.getLines()) {
                OrderLine line = new OrderLine();
                line.setOrder(order);
                line.setMenuItemId(lineDto.getMenuItemId());
                line.setQuantity(lineDto.getQuantity());
                line.setUnitPrice(lineDto.getUnitPrice());
                line.setSubtotal(lineDto.getSubtotal());
                
                // Hydrate MenuItem (Crucial for inventory depletion and mapping)
                MenuItem item = menuItemRepository.findById(lineDto.getMenuItemId())
                    .orElseThrow(() -> new java.util.NoSuchElementException("Menu item not found: " + lineDto.getMenuItemId()));
                line.setMenuItem(item);
                
                order.getLines().add(line);
            }
        }
        
        // Recalculate total if needed
        if (dto.getTotalAmount() == null) {
            BigDecimal total = order.getLines().stream()
                    .map(OrderLine::getSubtotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            order.setTotalAmount(total);
        } else {
            order.setTotalAmount(dto.getTotalAmount());
        }
        
        Order savedOrder = repository.save(order);
        
        // Trigger Physical Inventory Depletion
        inventoryService.orderFulfillment(savedOrder);
        
        return savedOrder;
    }

    @Transactional(readOnly = true)
    public Order.OrderStatus getOrderStatus(Long orderId) {
        return repository.findById(orderId)
                .map(Order::getStatus)
                .orElseThrow(() -> new java.util.NoSuchElementException("Order not found with id: " + orderId));
    }

    @Transactional
    public void updateStatus(Long orderId, Order.OrderStatus status) {
        Order order = repository.findById(orderId).orElseThrow();
        order.setStatus(status);
        repository.save(order);
    }

    @Transactional
    public void voidOrder(Long orderId, String reason) {
        Order order = repository.findById(orderId).orElseThrow();
        order.setStatus(Order.OrderStatus.CANCELLED);
        // TODO: Log void reason in an audit table
        repository.save(order);
    }

    @Transactional
    public void addItems(Long orderId, List<OrderLineDto> items) {
        Order order = repository.findById(orderId).orElseThrow();
        for (OrderLineDto lineDto : items) {
            OrderLine line = new OrderLine();
            line.setOrder(order);
            line.setMenuItemId(lineDto.getMenuItemId());
            line.setQuantity(lineDto.getQuantity());
            line.setUnitPrice(lineDto.getUnitPrice());
            line.setSubtotal(lineDto.getSubtotal());
            
            // Hydrate MenuItem
            MenuItem item = menuItemRepository.findById(lineDto.getMenuItemId())
                    .orElseThrow(() -> new java.util.NoSuchElementException("Menu item not found: " + lineDto.getMenuItemId()));
            line.setMenuItem(item);
            
            order.getLines().add(line);
            order.setTotalAmount(order.getTotalAmount().add(line.getSubtotal()));
        }
        Order savedOrder = repository.save(order);
        
        // Trigger depletion for new items
        // Note: orderFulfillment currently processes ALL lines. 
        // This might cause double depletion if not careful.
        // For now, following existing pattern but this should be optimized.
        inventoryService.orderFulfillment(savedOrder);
    }

    @Transactional
    public Order completeOrder(Long orderId) {
        Order order = repository.findById(orderId).orElseThrow();
        order.setStatus(Order.OrderStatus.PAID);
        repository.save(order);
        
        // Record experiment metric
        if (order.getSession() != null && order.getSession().getTable() != null) {
            Long resId = order.getSession().getTable().getRestaurant().getId();
            experimentService.recordMetric(resId, "TOTAL_SALES", order.getTotalAmount(), 
                java.util.Map.of("orderId", orderId.toString(), "type", "POS"));
        }
        
        // TODO: Publish OrderClosedEvent to trigger KPI update
        return order;
    }
}
