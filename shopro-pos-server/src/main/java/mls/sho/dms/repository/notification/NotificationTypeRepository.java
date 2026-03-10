package mls.sho.dms.repository.notification;

import mls.sho.dms.entity.notification.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationTypeRepository extends JpaRepository<NotificationType, UUID> {
    Optional<NotificationType> findByCode(String code);
    List<NotificationType> findAllByIsActiveTrue();
}
