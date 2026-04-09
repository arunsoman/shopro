package mls.sho.dms.repository.inventory;

import mls.sho.dms.entity.inventory.PurchaseOrderLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PurchaseOrderLineRepository extends JpaRepository<PurchaseOrderLine, UUID> {
    java.util.List<PurchaseOrderLine> findByPurchaseOrderId(UUID purchaseOrderId);
}
