package mls.sho.dms.repository.notification;

import mls.sho.dms.entity.notification.NotificationLog;
import mls.sho.dms.entity.notification.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, UUID> {
    List<NotificationLog> findByDispatchId(UUID dispatchId);
    
    List<NotificationLog> findByStatus(NotificationStatus status);
}
