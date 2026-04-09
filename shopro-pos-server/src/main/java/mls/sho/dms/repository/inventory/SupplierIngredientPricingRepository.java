package mls.sho.dms.repository.inventory;

import mls.sho.dms.entity.inventory.ingredient.RawIngredient;
import mls.sho.dms.entity.inventory.vendor.SupplierIngredientPricing;
import mls.sho.dms.entity.inventory.vendor.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SupplierIngredientPricingRepository extends JpaRepository<SupplierIngredientPricing, UUID> {
    List<SupplierIngredientPricing> findByIngredientId(UUID ingredientId);
    java.util.Optional<SupplierIngredientPricing> findBySupplierAndIngredient(Supplier supplier, RawIngredient ingredient);
    List<SupplierIngredientPricing> findAllByIngredient(RawIngredient ingredient);

    @org.springframework.data.jpa.repository.Query("SELECT p.ingredient.id FROM SupplierIngredientPricing p WHERE p.supplier.id = :supplierId")
    List<UUID> findByIngredientIdInSupplierCatalog(UUID supplierId);

    List<SupplierIngredientPricing> findBySupplierId(UUID supplierId);
}
