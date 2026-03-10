package mls.sho.dms.repository.notification;

import mls.sho.dms.entity.notification.NotificationTemplate;
import mls.sho.dms.entity.notification.NotificationType;
import mls.sho.dms.entity.notification.Channel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, UUID> {
    Optional<NotificationTemplate> findByNotificationTypeAndChannel(NotificationType notificationType, Channel channel);
}
