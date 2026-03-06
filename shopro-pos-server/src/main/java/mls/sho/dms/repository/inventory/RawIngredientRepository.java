package mls.sho.dms.repository.inventory;

import mls.sho.dms.entity.inventory.RawIngredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;

@Repository
public interface RawIngredientRepository extends JpaRepository<RawIngredient, UUID> {
    
    boolean existsByNameIgnoreCase(String name);
    
    @Query("SELECT r FROM RawIngredient r WHERE r.currentStock <= r.reorderPoint")
    List<RawIngredient> findLowStockIngredients();

    @Query("SELECT SUM(r.currentStock * r.costPerUnit) FROM RawIngredient r")
    BigDecimal calculateTotalInventoryValue();
}
