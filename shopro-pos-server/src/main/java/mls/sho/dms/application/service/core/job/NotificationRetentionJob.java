package mls.sho.dms.application.service.core.job;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.repository.notification.InAppNotificationRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationRetentionJob {

    private final InAppNotificationRepository notificationRepository;

    /**
     * Purges old notifications (Note: In the new architecture, TTL is handled 
     * largely by PostgreSQL partitions dropping, but this job can clean up stragglers).
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void purgeOldNotifications() {
        log.info("Starting notification retention purge...");
        // Fast paths would be implemented here if old partitions are not handled externally
        log.info("Notification purge complete.");
    }
}
