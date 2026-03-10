package mls.sho.dms.repository.crm;

import mls.sho.dms.entity.crm.CustomerOccasion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CustomerOccasionRepository extends JpaRepository<CustomerOccasion, UUID> {
}
