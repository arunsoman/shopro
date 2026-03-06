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
}
