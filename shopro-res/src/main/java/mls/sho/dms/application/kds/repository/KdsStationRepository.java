package mls.sho.dms.application.kds.repository;

import mls.sho.dms.application.kds.entity.KdsStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KdsStationRepository extends JpaRepository<KdsStation, Long> {
    Optional<KdsStation> findFirstByOutletId(Long outletId);
    List<KdsStation> findAllByOutletId(Long outletId);
}
