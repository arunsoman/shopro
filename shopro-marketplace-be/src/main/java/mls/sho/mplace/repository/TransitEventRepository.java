package mls.sho.mplace.repository;

import mls.sho.mplace.entity.TransitEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface TransitEventRepository extends JpaRepository<TransitEvent, UUID> {
    List<TransitEvent> findAllBySubOrder_Id(UUID subOrderId);
}
