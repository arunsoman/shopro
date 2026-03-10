package mls.sho.dms.repository.notification;

import mls.sho.dms.entity.notification.InAppNotification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InAppNotificationRepository extends JpaRepository<InAppNotification, UUID> {
    
    @Query("SELECT n FROM InAppNotification n WHERE n.recipientId = :recipientId AND n.isDismissed = false ORDER BY n.createdAt DESC")
    Page<InAppNotification> findActiveByRecipientId(@Param("recipientId") UUID recipientId, Pageable pageable);

    @Modifying
    @Query("UPDATE InAppNotification n SET n.isRead = true WHERE n.id = :id")
    void markAsRead(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE InAppNotification n SET n.isDismissed = true WHERE n.id = :id")
    void markAsDismissed(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE InAppNotification n SET n.isDismissed = true WHERE n.correlationId = :correlationId AND n.recipientId = :recipientId AND n.isDismissed = false")
    void dismissByCorrelationId(@Param("correlationId") String correlationId, @Param("recipientId") UUID recipientId);
}
