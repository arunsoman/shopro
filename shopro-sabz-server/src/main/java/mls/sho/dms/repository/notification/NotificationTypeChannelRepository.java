package mls.sho.dms.repository.notification;

import mls.sho.dms.entity.notification.NotificationTypeChannel;
import mls.sho.dms.entity.notification.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationTypeChannelRepository extends JpaRepository<NotificationTypeChannel, UUID> {
    
    @Query("SELECT ntc FROM NotificationTypeChannel ntc JOIN FETCH ntc.channel LEFT JOIN FETCH ntc.recipientGroup LEFT JOIN FETCH ntc.fallbackChannel WHERE ntc.notificationType = :type AND ntc.isActive = true")
    List<NotificationTypeChannel> findActiveRoutesByType(@Param("type") NotificationType type);
}
