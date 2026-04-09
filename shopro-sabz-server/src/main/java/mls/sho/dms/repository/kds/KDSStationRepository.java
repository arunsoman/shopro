package mls.sho.dms.repository.kds;

import mls.sho.dms.entity.kds.KDSStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mls.sho.dms.entity.kds.KDSStationType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface KDSStationRepository extends JpaRepository<KDSStation, UUID> {
    Optional<KDSStation> findByName(String name);
    List<KDSStation> findByOnlineTrue();
    List<KDSStation> findByStationTypeAndOnlineTrue(KDSStationType stationType);
}
