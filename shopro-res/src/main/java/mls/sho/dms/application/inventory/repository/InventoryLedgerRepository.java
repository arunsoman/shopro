package mls.sho.dms.application.inventory.repository;

import mls.sho.dms.common.enums.InventoryCategory;
import mls.sho.dms.application.inventory.entity.InventoryIngredientLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryLedgerRepository extends JpaRepository<InventoryIngredientLedger, Long> {

    // ============================================
    // RECORD PROJECTIONS (All in one place)
    // ============================================

    interface IngredientUsage {
        Long ingredientId();
        String ingredientDescription();
        BigDecimal totalQuantity();
        BigDecimal averageUnitCost();
    }

    record CategorySubtotal(
            InventoryCategory category,
            BigDecimal totalValue
    ) {}

    record DailyRevenue(
            java.util.Date date,
            BigDecimal totalAmount
    ) {}

    record DailyGuestCount(
            java.util.Date date,
            Long guestCount
    ) {}

    record DailyCogs(
            java.util.Date date,
            BigDecimal cogsAmount
    ) {}

    // ============================================
    // STANDARD METHODS
    // ============================================

    List<InventoryIngredientLedger> findAllByRestaurantIdAndIngredientIdOrderByCreatedAtDesc(
            Long restaurantId,
            Long ingredientId
    );

    List<InventoryIngredientLedger> findAllByOrderId(Long orderId);

    @Query("SELECT SUM(e.quantity) FROM InventoryIngredientLedger e WHERE e.restaurant.id = :restaurantId AND e.ingredient.id = :ingredientId")
    BigDecimal sumQuantityByIngredient(Long restaurantId, Long ingredientId);

    @Query("SELECT SUM(e.totalValue) FROM InventoryIngredientLedger e WHERE e.restaurant.id = :restaurantId AND e.ingredient.id = :ingredientId")
    BigDecimal sumValueByIngredient(Long restaurantId, Long ingredientId);

    @Query("SELECT SUM(e.totalValue) FROM InventoryIngredientLedger e WHERE e.restaurant.id = :restaurantId")
    BigDecimal sumValueByRestaurant(Long restaurantId);

    @Query("SELECT SUM(e.totalValue) FROM InventoryIngredientLedger e WHERE e.restaurant.id = :restaurantId AND e.ingredient.inventoryType = :type")
    BigDecimal sumValueByType(Long restaurantId, mls.sho.dms.common.enums.InventoryType type);

    @Query("SELECT SUM(e.totalValue) FROM InventoryIngredientLedger e WHERE e.ingredient.inventoryType = :type")
    BigDecimal sumGlobalValueByType(mls.sho.dms.common.enums.InventoryType type);

    @Query("SELECT SUM(ABS(e.totalValue)) FROM InventoryIngredientLedger e WHERE e.restaurant.id = :restaurantId AND e.createdAt BETWEEN :start AND :end AND e.eventType IN :types")
    BigDecimal sumValueByDateAndTypes(Long restaurantId, LocalDateTime start, LocalDateTime end,
                                      List<mls.sho.dms.common.enums.StockMovementType> types);

    @Query("SELECT e FROM InventoryIngredientLedger e WHERE e.restaurant.id = :restaurantId AND e.createdAt BETWEEN :start AND :end AND e.eventType IN :types")
    List<InventoryIngredientLedger> findAllByRestaurantIdAndDateAndTypes(Long restaurantId, LocalDateTime start, LocalDateTime end,
                                                                         List<mls.sho.dms.common.enums.StockMovementType> types);

    // ============================================
    // PROJECTION METHODS (Using nested records)
    // ============================================

    @Query("SELECT new mls.sho.dms.application.inventory.repository.InventoryLedgerRepository$CategorySubtotal(" +
            "e.ingredient.category, SUM(e.totalValue)) " +
            "FROM InventoryIngredientLedger e " +
            "WHERE e.restaurant.id = :restaurantId AND e.ingredient.inventoryType = :type " +
            "GROUP BY e.ingredient.category")
    List<CategorySubtotal> findCategorySubtotals(
            Long restaurantId,
            mls.sho.dms.common.enums.InventoryType type
    );

    @Query("SELECT new mls.sho.dms.application.inventory.repository.InventoryLedgerRepository$DailyRevenue(" +
            "CAST(o.createdAt AS date), SUM(o.totalAmount)) " +
            "FROM Order o " +
            "WHERE o.restaurantId = :restaurantId AND o.id IN " +
            "(SELECT DISTINCT l.orderId FROM InventoryIngredientLedger l " +
            " WHERE l.eventType = 'DEPLETION' AND l.reasonCode = 'POS_SALE' " +
            " AND l.createdAt BETWEEN :start AND :end) " +
            "GROUP BY CAST(o.createdAt AS date)")
    List<DailyRevenue> findDailyRevenueFromLedger(
            Long restaurantId,
            LocalDateTime start,
            LocalDateTime end
    );

    @Query("SELECT new mls.sho.dms.application.inventory.repository.InventoryLedgerRepository$DailyRevenue(" +
            "CAST(o.createdAt AS date), SUM(o.totalAmount)) " +
            "FROM Order o " +
            "WHERE o.id IN " +
            "(SELECT DISTINCT l.orderId FROM InventoryIngredientLedger l " +
            " WHERE l.eventType = 'DEPLETION' AND l.reasonCode = 'POS_SALE' " +
            " AND l.createdAt BETWEEN :start AND :end) " +
            "GROUP BY CAST(o.createdAt AS date)")
    List<DailyRevenue> findDailyRevenueFromLedgerGlobal(
            LocalDateTime start,
            LocalDateTime end
    );

    @Query("SELECT new mls.sho.dms.application.inventory.repository.InventoryLedgerRepository$DailyGuestCount(" +
            "CAST(s.openedAt AS date), SUM(s.guestCount)) " +
            "FROM TableSession s " +
            "WHERE s.id IN " +
            "(SELECT DISTINCT o.session.id FROM Order o WHERE o.restaurantId = :restaurantId AND o.id IN " +
            " (SELECT DISTINCT l.orderId FROM InventoryIngredientLedger l " +
            "  WHERE l.eventType = 'DEPLETION' AND l.reasonCode = 'POS_SALE' " +
            "  AND l.createdAt BETWEEN :start AND :end)) " +
            "GROUP BY CAST(s.openedAt AS date)")
    List<DailyGuestCount> findDailyGuestCountsFromLedger(
            Long restaurantId,
            LocalDateTime start,
            LocalDateTime end
    );

    @Query("SELECT new mls.sho.dms.application.inventory.repository.InventoryLedgerRepository$DailyGuestCount(" +
            "CAST(s.openedAt AS date), SUM(s.guestCount)) " +
            "FROM TableSession s " +
            "WHERE s.id IN " +
            "(SELECT DISTINCT o.session.id FROM Order o WHERE o.id IN " +
            " (SELECT DISTINCT l.orderId FROM InventoryIngredientLedger l " +
            "  WHERE l.eventType = 'DEPLETION' AND l.reasonCode = 'POS_SALE' " +
            "  AND l.createdAt BETWEEN :start AND :end)) " +
            "GROUP BY CAST(s.openedAt AS date)")
    List<DailyGuestCount> findDailyGuestCountsFromLedgerGlobal(
            LocalDateTime start,
            LocalDateTime end
    );

    @Query("SELECT new mls.sho.dms.application.inventory.repository.InventoryLedgerRepository$DailyCogs(" +
            "CAST(l.createdAt AS date), SUM(ABS(l.totalValue))) " +
            "FROM InventoryIngredientLedger l " +
            "WHERE l.restaurant.id = :restaurantId AND l.eventType = 'DEPLETION' " +
            "AND l.reasonCode = 'POS_SALE' AND l.createdAt BETWEEN :start AND :end " +
            "GROUP BY CAST(l.createdAt AS date)")
    List<DailyCogs> findDailyCogs(
            Long restaurantId,
            LocalDateTime start,
            LocalDateTime end
    );

    @Query("SELECT new mls.sho.dms.application.inventory.repository.InventoryLedgerRepository$DailyCogs(" +
            "CAST(l.createdAt AS date), SUM(ABS(l.totalValue))) " +
            "FROM InventoryIngredientLedger l " +
            "WHERE l.eventType = 'DEPLETION' AND l.reasonCode = 'POS_SALE' " +
            "AND l.createdAt BETWEEN :start AND :end " +
            "GROUP BY CAST(l.createdAt AS date)")
    List<DailyCogs> findDailyCogsGlobal(
            LocalDateTime start,
            LocalDateTime end
    );
    @Query("""
    SELECT 
        l.ingredient.id AS ingredientId,
        l.ingredient.description AS ingredientDescription,
        SUM(ABS(l.quantity)) AS totalQuantity,
        AVG(ABS(l.unitCost)) AS averageUnitCost
    FROM InventoryIngredientLedger l 
    WHERE l.restaurant.id = :restaurantId 
      AND l.eventType IN :types 
      AND l.createdAt BETWEEN :start AND :end 
    GROUP BY l.ingredient.id, l.ingredient.description
    """)
    List<IngredientUsage> findActualUsageByIngredient(
            @Param("restaurantId") Long restaurantId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("types") List<mls.sho.dms.common.enums.StockMovementType> types
    );

    @Modifying
    @Transactional
    @Query("DELETE FROM InventoryIngredientLedger l WHERE l.restaurant.id = :restaurantId")
    void deleteByRestaurantId(@Param("restaurantId") Long restaurantId);
}
