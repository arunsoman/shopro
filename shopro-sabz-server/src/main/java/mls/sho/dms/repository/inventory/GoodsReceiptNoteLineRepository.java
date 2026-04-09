package mls.sho.dms.repository.inventory;

import mls.sho.dms.entity.inventory.GoodsReceiptNoteLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GoodsReceiptNoteLineRepository extends JpaRepository<GoodsReceiptNoteLine, UUID> {
    List<GoodsReceiptNoteLine> findByGoodsReceiptNoteId(UUID goodsReceiptNoteId);
}
