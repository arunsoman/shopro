package mls.sho.dms.repository.tableside;

import mls.sho.dms.entity.tableside.GuestCartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GuestCartItemRepository extends JpaRepository<GuestCartItem, UUID> {
    List<GuestCartItem> findBySessionId(UUID sessionId);
    void deleteBySessionIdAndDeviceFingerprint(UUID sessionId, String deviceFingerprint);
}
