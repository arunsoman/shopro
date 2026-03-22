package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.InAppNotification;
import mls.sho.mplace.repository.InAppNotificationRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class InAppNotificationController {

    private final InAppNotificationRepository repository;

    @GetMapping
    public List<InAppNotification> getNotifications(@RequestParam UUID userId) {
        return repository.findByRecipientIdAndIsDismissedFalseOrderByCreatedAtDesc(userId);
    }

    @PatchMapping("/{id}/read")
    public void markRead(@PathVariable UUID id) {
        InAppNotification n = repository.findById(id).orElseThrow();
        n.setRead(true);
        repository.save(n);
    }

    @PatchMapping("/{id}/dismiss")
    public void dismiss(@PathVariable UUID id) {
        InAppNotification n = repository.findById(id).orElseThrow();
        n.setDismissed(true);
        repository.save(n);
    }
}
