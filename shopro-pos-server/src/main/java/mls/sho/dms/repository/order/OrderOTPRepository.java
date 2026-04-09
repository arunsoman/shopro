package mls.sho.dms.repository.order;

import mls.sho.dms.entity.order.OrderOTP;
import mls.sho.dms.entity.order.OrderTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderOTPRepository extends JpaRepository<OrderOTP, UUID> {
    Optional<OrderOTP> findByOrder(OrderTicket order);
    Optional<OrderOTP> findByOrderId(UUID orderId);
}
