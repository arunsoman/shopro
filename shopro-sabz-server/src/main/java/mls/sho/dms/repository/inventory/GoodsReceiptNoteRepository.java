package mls.sho.dms.repository.inventory;

import mls.sho.dms.entity.inventory.GoodsReceiptNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GoodsReceiptNoteRepository extends JpaRepository<GoodsReceiptNote, UUID> {
    List<GoodsReceiptNote> findByPurchaseOrderId(UUID purchaseOrderId);
}
