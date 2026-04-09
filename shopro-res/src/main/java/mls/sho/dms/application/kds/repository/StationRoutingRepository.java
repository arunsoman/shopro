package mls.sho.dms.application.kds.repository;

import mls.sho.dms.application.kds.entity.StationRouting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StationRoutingRepository extends JpaRepository<StationRouting, Long> {
    List<StationRouting> findByStationId(Long stationId);
    List<StationRouting> findByStationOutletId(Long outletId);
}
