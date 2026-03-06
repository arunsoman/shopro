package mls.sho.dms.repository.inventory;

import mls.sho.dms.entity.inventory.BatchRecord;
import mls.sho.dms.entity.inventory.BatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface BatchRecordRepository extends JpaRepository<BatchRecord, UUID> {
    
    @Query("SELECT b FROM BatchRecord b WHERE b.subRecipe.id = :subRecipeId AND b.status = :status ORDER BY b.producedAt ASC")
    List<BatchRecord> findActiveBySubRecipe(UUID subRecipeId, BatchStatus status);

    List<BatchRecord> findByStatusAndExpiryAtBefore(BatchStatus status, Instant now);
}
