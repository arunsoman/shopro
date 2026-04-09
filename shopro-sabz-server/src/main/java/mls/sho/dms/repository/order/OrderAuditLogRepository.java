package mls.sho.dms.repository.order;

import mls.sho.dms.entity.order.OrderAuditLog;
import mls.sho.dms.entity.order.OrderTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderAuditLogRepository extends JpaRepository<OrderAuditLog, UUID> {
    List<OrderAuditLog> findByOrderOrderByCreatedAtAsc(OrderTicket order);
}
