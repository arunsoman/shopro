package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.NotificationLog;
import mls.sho.mplace.entity.NotificationType;
import mls.sho.mplace.entity.Channel;
import mls.sho.mplace.repository.NotificationLogRepository;
import mls.sho.mplace.repository.NotificationTypeRepository;
import mls.sho.mplace.repository.ChannelRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/operator/administration/notifications")
@RequiredArgsConstructor
public class NotificationAdminController {

    private final NotificationTypeRepository typeRepository;
    private final ChannelRepository channelRepository;
    private final NotificationLogRepository logRepository;

    @GetMapping("/types")
    public List<NotificationType> getTypes() {
        return typeRepository.findAll();
    }

    @GetMapping("/channels")
    public List<Channel> getChannels() {
        return channelRepository.findAll();
    }

    @GetMapping("/logs")
    public Page<NotificationLog> getLogs(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return logRepository.findAll(pageable);
    }

    @PostMapping("/types")
    public NotificationType createType(@RequestBody NotificationType type) {
        return typeRepository.save(type);
    }

    @PatchMapping("/types/{id}/deactivate")
    public NotificationType deactivateType(@PathVariable java.util.UUID id) {
        NotificationType type = typeRepository.findById(id).orElseThrow();
        type.setActive(false);
        return typeRepository.save(type);
    }

    @PatchMapping("/channels/{id}")
    public Channel updateChannel(@PathVariable java.util.UUID id, @RequestBody Channel channelUpdate) {
        Channel channel = channelRepository.findById(id).orElseThrow();
        if (channelUpdate.getConfig() != null) {
            channel.setConfig(channelUpdate.getConfig());
        }
        channel.setActive(channelUpdate.isActive());
        return channelRepository.save(channel);
    }

    @PostMapping("/test")
    public java.util.Map<String, String> testNotification(@RequestBody java.util.Map<String, String> payload) {
        // In a real system, this would call NotifyService. 
        // For now, we return a success trace.
        return java.util.Map.of(
            "status", "SUCCESS",
            "provider_trace", "Message accepted by gateway",
            "timestamp", java.time.LocalDateTime.now().toString()
        );
    }
}
