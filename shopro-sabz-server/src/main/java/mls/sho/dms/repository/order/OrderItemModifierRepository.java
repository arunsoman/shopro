package mls.sho.dms.repository.order;

import mls.sho.dms.entity.order.OrderItemModifier;
import mls.sho.dms.entity.order.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderItemModifierRepository extends JpaRepository<OrderItemModifier, UUID> {

    /** Find all modifiers for a specific line item. */
    List<OrderItemModifier> findByOrderItem(OrderItem orderItem);
}
