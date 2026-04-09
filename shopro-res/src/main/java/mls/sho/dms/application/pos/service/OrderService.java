package mls.sho.dms.application.pos.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.pos.repository.OrderRepository;
import mls.sho.dms.application.pos.repository.TableSessionRepository;
import mls.sho.dms.entity.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository repository;
    private final TableSessionRepository sessionRepository;
    private final mls.sho.dms.application.analytics.service.ExperimentService experimentService;
    private final mls.sho.dms.application.inventory.service.InventoryIntelligenceService inventoryService;

    @Transactional
    public Order placeOrder(Order order) {
        // Ensure session is attached
        if (order.getSession() != null && order.getSession().getId() != null) {
            order.setSession(sessionRepository.findById(order.getSession().getId()).orElseThrow());
        }
        
        // Recalculate total
        BigDecimal total = order.getLines().stream()
                .map(line -> {
                    line.setOrder(order);
                    return line.getSubtotal();
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotalAmount(total);
        
        Order savedOrder = repository.save(order);
        
        // Trigger Physical Inventory Depletion
        inventoryService.orderFulfillment(savedOrder);
        
        return savedOrder;
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
    public void addItems(Long orderId, java.util.List<mls.sho.dms.entity.OrderLine> items) {
        Order order = repository.findById(orderId).orElseThrow();
        for (mls.sho.dms.entity.OrderLine item : items) {
            item.setOrder(order);
            order.getLines().add(item);
            order.setTotalAmount(order.getTotalAmount().add(item.getSubtotal()));
        }
        repository.save(order);
    }

    @Transactional
    public void completeOrder(Long orderId) {
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
    }
}
