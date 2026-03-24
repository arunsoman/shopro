package mls.sho.mplace.repository;

import mls.sho.mplace.entity.SupplyList;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SupplyListRepository extends JpaRepository<SupplyList, UUID> {
    List<SupplyList> findBySupplierId(UUID supplierId);
    Optional<SupplyList> findBySupplierIdAndFoodId(UUID supplierId, Integer foodId);
    List<SupplyList> findAllByFoodId(Integer foodId);
    List<SupplyList> findAllByFoodIdIn(java.util.Collection<Integer> foodIds);
    List<SupplyList> findAllByFoodIdAndIsAvailableTrueAndStockQtyGreaterThanOrderByPriceAsc(Integer foodId, Double minStock);
}
