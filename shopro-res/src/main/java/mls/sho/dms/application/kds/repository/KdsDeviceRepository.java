package mls.sho.dms.application.kds.repository;

import mls.sho.dms.application.kds.entity.KdsDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KdsDeviceRepository extends JpaRepository<KdsDevice, Long> {
    List<KdsDevice> findByStationId(Long stationId);
    List<KdsDevice> findByStationOutletId(Long outletId);
}
