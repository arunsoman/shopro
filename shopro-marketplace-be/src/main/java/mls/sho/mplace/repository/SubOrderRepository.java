package mls.sho.mplace.repository;

import mls.sho.mplace.entity.SubOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SubOrderRepository extends JpaRepository<SubOrder, UUID> {
    List<SubOrder> findAllByPurchaseOrder_Restaurant_Id(UUID restaurantId);
    List<SubOrder> findAllBySupplier_Id(UUID supplierId);
    List<SubOrder> findAllByPurchaseOrder_Id(UUID purchaseOrderId);
}
