package mls.sho.mplace.repository;

import mls.sho.mplace.entity.POActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface POActivityRepository extends JpaRepository<POActivity, UUID> {
    List<POActivity> findByPurchaseOrderIdOrderByActivityDateAsc(UUID purchaseOrderId);
    long countByActivityDateAfter(java.time.LocalDateTime date);
    long countByStatusAndActivityDateAfter(String status, java.time.LocalDateTime date);
}
