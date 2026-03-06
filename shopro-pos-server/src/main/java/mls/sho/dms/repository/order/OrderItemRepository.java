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
}
