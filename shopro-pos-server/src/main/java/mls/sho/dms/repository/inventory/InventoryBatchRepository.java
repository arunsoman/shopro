package mls.sho.dms.repository.inventory;

import mls.sho.dms.entity.inventory.stock.InventoryBatch;
import mls.sho.dms.entity.inventory.recipe.BatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface InventoryBatchRepository extends JpaRepository<InventoryBatch, UUID> {
    List<InventoryBatch> findAllByIngredientIdAndStatusOrderByExpiryDateAsc(UUID ingredientId, BatchStatus status);
    List<InventoryBatch> findAllByStatusOrderByExpiryDateAsc(BatchStatus status);
}
