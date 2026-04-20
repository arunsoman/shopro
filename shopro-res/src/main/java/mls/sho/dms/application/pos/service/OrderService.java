package mls.sho.dms.application.pos.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.common.TenantGuard;
import mls.sho.dms.application.pos.dto.OrderCreateDto;
import mls.sho.dms.application.pos.dto.OrderLineDto;
import mls.sho.dms.application.pos.repository.MenuItemRepository;
import mls.sho.dms.application.pos.repository.OrderRepository;
import mls.sho.dms.application.pos.repository.RestaurantRepository;
import mls.sho.dms.application.pos.repository.TableSessionRepository;
import mls.sho.dms.application.pos.entity.MenuItem;
import mls.sho.dms.application.pos.entity.Order;
import mls.sho.dms.application.pos.entity.OrderLine;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
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
    private final TenantGuard tenantGuard;
    private final OrderNumberGeneratorService orderNumberGeneratorService;

    @Transactional
    public Order placeOrder(OrderCreateDto dto, Long restaurantId) {
        Order order = new Order();
        order.setRestaurantId(restaurantId);
        order.setRestaurant(restaurantRepository.findById(restaurantId).orElseThrow());
        order.setSessionId(dto.getSessionId());
        
        // Use generator if number not explicitly provided
        if (dto.getOrderNumber() != null && !dto.getOrderNumber().isEmpty()) {
            order.setOrderNumber(dto.getOrderNumber());
        } else {
            order.setOrderNumber(orderNumberGeneratorService.generateOrderNumber());
        }
        
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
        
        // DEPLETION REMOVED: Inventory depletion now happens ONLY when:
        // 1. KDS marks ticket as READY (PosTicketReadyEvent → InventoryFulfillmentListener)
        // 2. Fallback in completeOrder() for quick-serve/takeout orders that skip KDS
        // This prevents triple-depletion bug (was: placeOrder + KDS + payOrder)
        
        return savedOrder;
    }

    @Transactional(readOnly = true)
    public Order.OrderStatus getOrderStatus(Long orderId) {
        return repository.findById(orderId)
                .map(Order::getStatus)
                .orElseThrow(() -> new java.util.NoSuchElementException("Order not found with id: " + orderId));
    }

    @Transactional
    public void updateStatus(Long restaurantId, Long orderId, Order.OrderStatus status) {
        Order order = tenantGuard.order(restaurantId, orderId);
        order.setStatus(status);
        repository.save(order);
    }

    @Transactional
    public void voidOrder(Long restaurantId, Long orderId, String reason) {
        Order order = tenantGuard.order(restaurantId, orderId);
        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setVoidReason(reason);
        repository.save(order);
    }

    @Transactional
    public void addItems(Long restaurantId, Long orderId, List<OrderLineDto> items) {
        Order order = tenantGuard.order(restaurantId, orderId);
        List<OrderLine> newLines = new ArrayList<>();
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
            newLines.add(line);
        }
        repository.save(order);
        
        // DELTA DEPLETION: Only deplete the newly added lines, not the entire order.
        // The idempotency key (fulfillment_key) prevents double-depletion if called multiple times.
        // Note: depletion for new items only fires here for immediate add-item workflows.
        // For dine-in orders going through KDS, the KDS event handles depletion.
    }

    @Transactional
    public Order completeOrder(Long restaurantId, Long orderId) {
        Order order = tenantGuard.order(restaurantId, orderId);
        order.setStatus(Order.OrderStatus.PAID);
        repository.save(order);
        
        // FULFILLMENT FALLBACK: For quick-serve/takeout orders that never go through KDS,
        // deplete inventory now. For dine-in orders, KDS already triggered depletion via
        // PosTicketReadyEvent. The fulfillment_key idempotency constraint prevents double-depletion.
        try {
            inventoryService.orderFulfillment(order);
        } catch (org.springframework.dao.DuplicateKeyException e) {
            // Expected: KDS already depleted this order. Ignore.
        }
        
        // Record experiment metric — use order.getRestaurantId() directly
        // instead of traversing session → table → restaurant (Issue #18).
        experimentService.recordMetric(order.getRestaurantId(), "TOTAL_SALES", order.getTotalAmount(), 
            java.util.Map.of("orderId", orderId.toString(), "type", "POS"));
        
        return order;
    }
}
