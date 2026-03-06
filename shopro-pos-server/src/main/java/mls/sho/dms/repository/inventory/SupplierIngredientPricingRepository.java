package mls.sho.dms.repository.inventory;

import mls.sho.dms.entity.inventory.SupplierIngredientPricing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SupplierIngredientPricingRepository extends JpaRepository<SupplierIngredientPricing, UUID> {
    List<SupplierIngredientPricing> findByIngredientId(UUID ingredientId);
    java.util.Optional<SupplierIngredientPricing> findBySupplierAndIngredient(mls.sho.dms.entity.inventory.Supplier supplier, mls.sho.dms.entity.inventory.RawIngredient ingredient);
    List<SupplierIngredientPricing> findAllByIngredient(mls.sho.dms.entity.inventory.RawIngredient ingredient);
}
