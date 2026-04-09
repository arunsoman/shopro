package mls.sho.dms.application.kds.repository;

import mls.sho.dms.application.kds.entity.KdsSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KdsSettingsRepository extends JpaRepository<KdsSettings, Long> {
    Optional<KdsSettings> findByOutletId(Long outletId);
}
