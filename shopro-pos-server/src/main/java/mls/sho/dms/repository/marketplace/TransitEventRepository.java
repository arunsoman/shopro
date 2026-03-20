package mls.sho.dms.repository.marketplace;

import mls.sho.dms.entity.marketplace.TransitEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TransitEventRepository extends JpaRepository<TransitEvent, UUID> {
    List<TransitEvent> findByPoIdOrderByOccurredAtAsc(UUID poId);
}
