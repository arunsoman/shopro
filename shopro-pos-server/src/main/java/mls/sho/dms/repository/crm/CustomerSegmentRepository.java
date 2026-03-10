package mls.sho.dms.repository.crm;

import mls.sho.dms.entity.crm.CustomerSegment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CustomerSegmentRepository extends JpaRepository<CustomerSegment, UUID> {
    boolean existsByName(String name);
}
