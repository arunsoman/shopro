package mls.sho.dms.repository.inventory;

import mls.sho.dms.entity.inventory.RFQ;
import mls.sho.dms.entity.inventory.RfqStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RFQRepository extends JpaRepository<RFQ, UUID> {
    List<RFQ> findByStatus(RfqStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(r) FROM RFQ r WHERE r.ingredient.id IN :ingredientIds AND r.status = :status")
    int countActiveRfqsByIngredientIds(List<UUID> ingredientIds, RfqStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT r FROM RFQ r WHERE r.ingredient.id IN :ingredientIds AND r.status = :status")
    List<RFQ> findOpenRfqsByIngredientIds(List<UUID> ingredientIds, RfqStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT r FROM RFQ r WHERE r.ingredient.id = :ingredientId AND r.status = :status ORDER BY r.createdAt DESC")
    java.util.List<RFQ> findActiveRfqsByIngredientId(UUID ingredientId, RfqStatus status);
}
