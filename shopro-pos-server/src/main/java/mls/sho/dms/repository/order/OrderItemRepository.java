package mls.sho.dms.repository.order;

import mls.sho.dms.entity.order.OrderItem;
import mls.sho.dms.entity.order.OrderTicket;
import mls.sho.dms.entity.order.OrderItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

    /** Find all items for a ticket, including those that are voided. */
    List<OrderItem> findByTicketOrderByCreatedAtAsc(OrderTicket ticket);

    /** Find only active (non-voided) items for a ticket. */
    List<OrderItem> findByTicketAndStatusNotOrderByCreatedAtAsc(OrderTicket ticket, OrderItemStatus status);

    /** Find all items with a specific status across all tickets. */
    List<OrderItem> findByStatus(OrderItemStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT oi.menuItem.id, SUM(oi.quantity), SUM(oi.quantity * (oi.unitPrice + oi.modifierUpchargeTotal)) " +
           "FROM OrderItem oi WHERE oi.status NOT IN ('VOIDED', 'CANCELLED') " +
           "AND oi.createdAt BETWEEN :from AND :to " +
           "GROUP BY oi.menuItem.id")
    List<Object[]> sumSalesByMenuItem(java.time.Instant from, java.time.Instant to);

    @org.springframework.data.jpa.repository.Query("SELECT oi.menuItem.category.name, SUM(oi.quantity), SUM(oi.quantity * (oi.unitPrice + oi.modifierUpchargeTotal)) " +
           "FROM OrderItem oi WHERE oi.status NOT IN ('VOIDED', 'CANCELLED') " +
           "AND oi.createdAt BETWEEN :from AND :to " +
           "GROUP BY oi.menuItem.category.name")
    List<Object[]> sumSalesByCategory(java.time.Instant from, java.time.Instant to);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT oi.ticket.id) FROM OrderItem oi " +
           "WHERE oi.status NOT IN ('VOIDED', 'CANCELLED') AND oi.createdAt BETWEEN :from AND :to")
    long countCompletedTickets(java.time.Instant from, java.time.Instant to);
}
