package mls.sho.mplace.repository;

import mls.sho.mplace.entity.LogisticsZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface LogisticsZoneRepository extends JpaRepository<LogisticsZone, UUID> {
}
