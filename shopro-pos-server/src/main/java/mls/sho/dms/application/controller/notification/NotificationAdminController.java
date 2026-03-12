package mls.sho.dms.application.controller.notification;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.notification.*;
import mls.sho.dms.entity.notification.Channel;
import mls.sho.dms.entity.notification.NotificationType;
import mls.sho.dms.entity.notification.NotificationTypeChannel;
import mls.sho.dms.entity.notification.RecipientGroup;
import mls.sho.dms.repository.notification.ChannelRepository;
import mls.sho.dms.repository.notification.NotificationTypeChannelRepository;
import mls.sho.dms.repository.notification.NotificationTypeRepository;
import mls.sho.dms.repository.notification.RecipientGroupRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/notification-admin")
@RequiredArgsConstructor
public class NotificationAdminController {

    private final NotificationTypeRepository typeRepository;
    private final RecipientGroupRepository groupRepository;
    private final ChannelRepository channelRepository;
    private final NotificationTypeChannelRepository routingRepository;

    @GetMapping("/routing-matrix")
    public ResponseEntity<NotificationRoutingMatrixDTO> getRoutingMatrix() {
        List<NotificationType> types = typeRepository.findAllByIsActiveTrue();
        List<RecipientGroup> groups = groupRepository.findAll();
        List<Channel> channels = channelRepository.findAll();
        List<NotificationTypeChannel> allRoutes = routingRepository.findAll();

        Map<String, Map<String, List<String>>> matrix = new HashMap<>();

        for (NotificationTypeChannel route : allRoutes) {
            String typeCode = route.getNotificationType().getCode();
            String groupRoleCode = route.getRecipientGroup() != null ? route.getRecipientGroup().getRoleCode() : "SYSTEM";
            String channelType = route.getChannel().getType().name();

            matrix.computeIfAbsent(typeCode, k -> new HashMap<>())
                  .computeIfAbsent(groupRoleCode, k -> new ArrayList<>())
                  .add(channelType);
        }

        NotificationRoutingMatrixDTO dto = NotificationRoutingMatrixDTO.builder()
                .types(types.stream().map(t -> new NotificationTypeDTO(t.getCode(), t.getName())).collect(Collectors.toList()))
                .groups(groups.stream().map(g -> new RecipientGroupDTO(g.getId(), g.getName(), g.getRoleCode())).collect(Collectors.toList()))
                .channels(channels.stream().map(c -> new ChannelDTO(c.getId(), c.getType().name(), c.getName())).collect(Collectors.toList()))
                .matrix(matrix)
                .build();

        return ResponseEntity.ok(dto);
    }

    @PostMapping("/routing-matrix")
    public ResponseEntity<Void> updateRoutingMatrix(@RequestBody Map<String, Map<String, List<String>>> updates) {
        // Simple implementation: clear and rebuild based on the payload
        // In a production app, we would ideally perform delta updates
        
        // However, for this POS system, we'll implement a clean update
        List<NotificationTypeChannel> allRoutes = routingRepository.findAll();
        routingRepository.deleteAll(allRoutes);

        List<NotificationTypeChannel> newRoutes = new ArrayList<>();

        for (Map.Entry<String, Map<String, List<String>>> typeEntry : updates.entrySet()) {
            NotificationType type = typeRepository.findByCode(typeEntry.getKey()).orElse(null);
            if (type == null) continue;

            for (Map.Entry<String, List<String>> groupEntry : typeEntry.getValue().entrySet()) {
                RecipientGroup group = groupRepository.findByRoleCode(groupEntry.getKey()).orElse(null);
                // If group is null, it might be a system targeting or invalid
                
                for (String channelTypeStr : groupEntry.getValue()) {
                    Channel channel = channelRepository.findByTypeAndIsActiveTrue(mls.sho.dms.entity.notification.ChannelType.valueOf(channelTypeStr)).stream().findFirst().orElse(null);
                    if (channel == null) continue;

                    NotificationTypeChannel route = new NotificationTypeChannel();
                    route.setNotificationType(type);
                    route.setRecipientGroup(group);
                    route.setChannel(channel);
                    route.setActive(true);
                    newRoutes.add(route);
                }
            }
        }

        routingRepository.saveAll(newRoutes);
        return ResponseEntity.ok().build();
    }
}
