package mls.sho.dms.repository.tableside;

import mls.sho.dms.entity.tableside.TablesideSession;
import mls.sho.dms.entity.tableside.TablesideSessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TablesideSessionRepository extends JpaRepository<TablesideSession, UUID> {
    Optional<TablesideSession> findByQrToken(UUID qrToken);
    Optional<TablesideSession> findByTableIdAndStatus(UUID tableId, TablesideSessionStatus status);
}
