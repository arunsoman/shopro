package mls.sho.dms.web.controller.notification;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.notification.NotificationManualTriggerRequest;
import mls.sho.dms.application.service.core.NotificationEngine;
import mls.sho.dms.entity.notification.InAppNotification;
import mls.sho.dms.entity.notification.NotificationType;
import mls.sho.dms.repository.notification.InAppNotificationRepository;
import mls.sho.dms.repository.notification.NotificationTypeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final InAppNotificationRepository notificationRepository;
    private final NotificationTypeRepository typeRepository;
    private final NotificationEngine notificationEngine;

    @GetMapping("/types")
    public ResponseEntity<List<NotificationType>> getNotificationTypes() {
        return ResponseEntity.ok(typeRepository.findAllByIsActiveTrue());
    }

    @GetMapping
    public ResponseEntity<Page<InAppNotification>> getNotifications(
            @RequestParam UUID userId,
            Pageable pageable) {
        return ResponseEntity.ok(notificationRepository.findActiveByRecipientId(userId, pageable));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID id) {
        notificationEngine.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/dismiss")
    public ResponseEntity<Void> markAsDismissed(@PathVariable UUID id) {
        notificationEngine.markAsDismissed(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/dispatch")
    public ResponseEntity<Void> dispatchNotification(@RequestBody NotificationManualTriggerRequest request) {
        notificationEngine.dispatchManualNotification(request);
        return ResponseEntity.ok().build();
    }
}
