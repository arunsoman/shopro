package mls.sho.dms.repository.order;

import mls.sho.dms.entity.order.OrderTicket;
import mls.sho.dms.entity.order.TicketStatus;
import mls.sho.dms.entity.floor.TableShape;
import mls.sho.dms.entity.staff.StaffMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderTicketRepository extends JpaRepository<OrderTicket, UUID> {

    /** Find the active (not paid or voided) ticket for a specific table. */
    @Query("SELECT o FROM OrderTicket o WHERE o.table = :table AND o.status IN ('OPEN', 'SUBMITTED', 'PARTIALLY_PAID')")
    Optional<OrderTicket> findActiveTicketByTable(TableShape table);

    /** Find all open/submitted tickets for a server, sorted by newest first. */
    List<OrderTicket> findByServerAndStatusInOrderByCreatedAtDesc(StaffMember server, List<TicketStatus> statuses);

    /** Find all tickets for a table with specific statuses. */
    List<OrderTicket> findByTableAndStatusIn(TableShape table, List<TicketStatus> statuses);

    /** Find all tickets by status, sorted by newest first. */
    List<OrderTicket> findByStatusOrderByCreatedAtDesc(TicketStatus status);

    /** Find all tickets with any of the specified statuses, newest first. */
    List<OrderTicket> findByStatusInOrderByCreatedAtDesc(java.util.Collection<TicketStatus> statuses);

    /** Find sub-tickets for a split bill. */
    List<OrderTicket> findByParentTicket(OrderTicket parentTicket);

    @Query("SELECT o FROM OrderTicket o " +
           "LEFT JOIN o.table t " +
           "WHERE (:orderId IS NULL OR CAST(o.id AS string) LIKE %:orderId%) " +
           "AND (:tableName IS NULL OR (t IS NOT NULL AND t.name LIKE %:tableName%)) " +
           "AND (:serverName IS NULL OR o.server.fullName LIKE %:serverName%) " +
           "AND (CAST(:startDate AS timestamp) IS NULL OR o.createdAt >= :startDate) " +
           "AND (CAST(:endDate AS timestamp) IS NULL OR o.createdAt <= :endDate) " +
           "AND o.status IN :statuses " +
           "ORDER BY o.createdAt DESC")
    List<OrderTicket> searchHistory(
        @org.springframework.data.repository.query.Param("orderId") String orderId,
        @org.springframework.data.repository.query.Param("tableName") String tableName,
        @org.springframework.data.repository.query.Param("startDate") java.time.Instant startDate,
        @org.springframework.data.repository.query.Param("endDate") java.time.Instant endDate,
        @org.springframework.data.repository.query.Param("serverName") String serverName,
        @org.springframework.data.repository.query.Param("statuses") List<TicketStatus> statuses,
        Pageable pageable
    );
}
