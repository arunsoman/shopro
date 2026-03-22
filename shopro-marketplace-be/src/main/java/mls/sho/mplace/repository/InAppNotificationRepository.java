package mls.sho.mplace.repository;

import mls.sho.mplace.entity.InAppNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InAppNotificationRepository extends JpaRepository<InAppNotification, UUID> {
    List<InAppNotification> findByRecipientIdAndIsDismissedFalseOrderByCreatedAtDesc(UUID recipientId);
}
