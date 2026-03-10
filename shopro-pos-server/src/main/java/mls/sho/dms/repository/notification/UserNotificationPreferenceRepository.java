package mls.sho.dms.repository.notification;

import mls.sho.dms.entity.notification.UserNotificationPreference;
import mls.sho.dms.entity.notification.NotificationType;
import mls.sho.dms.entity.notification.Channel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserNotificationPreferenceRepository extends JpaRepository<UserNotificationPreference, UUID> {
    List<UserNotificationPreference> findByUserId(UUID userId);
    
    Optional<UserNotificationPreference> findByUserIdAndNotificationTypeAndChannel(UUID userId, NotificationType type, Channel channel);
}
