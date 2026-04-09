package mls.sho.dms.repository.management;

import mls.sho.dms.entity.management.ManagementProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface ManagementProfileRepository extends JpaRepository<ManagementProfile, UUID> {
}
