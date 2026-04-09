package mls.sho.dms.repository.inventory;

import mls.sho.dms.entity.inventory.stock.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

import mls.sho.dms.entity.inventory.stock.InventoryTransactionType;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, UUID> {
    
    List<InventoryTransaction> findAllByTransactionTypeOrderByTransactedAtDesc(InventoryTransactionType type);
    
    @Query("SELECT SUM(t.quantityDelta) FROM InventoryTransaction t " +
           "WHERE t.ingredient.id = :ingredientId AND t.transactionType = :type " +
           "AND t.transactedAt BETWEEN :startDate AND :endDate")
    BigDecimal sumQuantityDeltasByTypeAndDateRange(UUID ingredientId, InventoryTransactionType type, Instant startDate, Instant endDate);

    @Query("SELECT SUM(t.quantityDelta) FROM InventoryTransaction t " +
           "WHERE t.ingredient.id = :ingredientId AND t.transactedAt < :date")
    BigDecimal sumQuantityDeltasBefore(UUID ingredientId, Instant date);

    @Query("SELECT SUM(ABS(t.quantityDelta) * t.unitCostAtTime) FROM InventoryTransaction t " +
           "WHERE t.transactionType = mls.sho.dms.entity.inventory.InventoryTransactionType.WASTE " +
           "AND t.transactedAt >= :startDate")
    BigDecimal calculateTotalWasteValueSince(Instant startDate);
}
