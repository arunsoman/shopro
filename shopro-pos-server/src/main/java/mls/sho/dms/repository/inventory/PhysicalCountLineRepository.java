package mls.sho.dms.repository.inventory;

import mls.sho.dms.entity.inventory.PhysicalCountLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PhysicalCountLineRepository extends JpaRepository<PhysicalCountLine, UUID> {
    
    @Query("SELECT pcl.countedQty FROM PhysicalCountLine pcl " +
           "WHERE pcl.ingredient.id = :ingredientId " +
           "AND pcl.physicalCount.countDate BETWEEN :startDate AND :endDate " +
           "ORDER BY pcl.physicalCount.countDate DESC LIMIT 1")
    Optional<BigDecimal> findLatestCountedQuantityInDateRange(UUID ingredientId, Instant startDate, Instant endDate);
}
