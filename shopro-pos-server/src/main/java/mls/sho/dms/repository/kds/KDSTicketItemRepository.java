package mls.sho.dms.repository.kds;

import mls.sho.dms.entity.kds.KDSTicketItem;
import mls.sho.dms.entity.kds.KDSItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface KDSTicketItemRepository extends JpaRepository<KDSTicketItem, UUID> {
    List<KDSTicketItem> findByKdsTicket_Id(UUID kdsTicketId);
    List<KDSTicketItem> findByOrderItem_Id(UUID orderItemId);
}
