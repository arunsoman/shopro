package mls.sho.dms.repository.inventory;

import mls.sho.dms.entity.inventory.PurchaseOrder;
import mls.sho.dms.entity.inventory.PurchaseOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, UUID> {
    long countByStatusIn(Collection<PurchaseOrderStatus> statuses);
    List<PurchaseOrder> findAllByStatusIn(Collection<PurchaseOrderStatus> statuses);

    @org.springframework.data.jpa.repository.Query("SELECT po FROM PurchaseOrder po JOIN po.lines pol WHERE pol.ingredient.id = :ingredientId AND po.status NOT IN :completedStatuses ORDER BY po.createdAt DESC")
    java.util.List<PurchaseOrder> findActiveOrdersByIngredientId(java.util.UUID ingredientId, java.util.Collection<PurchaseOrderStatus> completedStatuses);
}
