package mls.sho.dms.repository.inventory;

import mls.sho.dms.entity.inventory.procurement.POStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface POStatusHistoryRepository extends JpaRepository<POStatusHistory, UUID> {
    List<POStatusHistory> findByPurchaseOrder_IdOrderByCreatedAtDesc(UUID poId);
}
