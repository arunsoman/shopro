package mls.sho.dms.application.service.core.impl;

import java.util.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.dto.notification.NotificationManualTriggerRequest;
import mls.sho.dms.application.service.core.NotificationEngine;
import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.repository.staff.StaffRepository;
import mls.sho.dms.entity.notification.ChannelType;
import mls.sho.dms.entity.notification.InAppNotification;
import mls.sho.dms.entity.notification.NotificationType;
import mls.sho.dms.entity.notification.NotificationTypeChannel;
import mls.sho.dms.entity.notification.RecipientGroup;
import mls.sho.dms.entity.notification.Recipient;
import mls.sho.dms.repository.notification.InAppNotificationRepository;
import mls.sho.dms.repository.notification.NotificationTypeChannelRepository;
import mls.sho.dms.repository.notification.NotificationTypeRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class NotificationEngineImpl implements NotificationEngine {

    private final InAppNotificationRepository inAppRepository;
    private final NotificationTypeRepository typeRepository;
    private final NotificationTypeChannelRepository routingRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final StaffRepository staffRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void sendNotification(String typeCode, String title, String body,
                                 Map<String, Object> data, String correlationId) {
        
        NotificationType type = typeRepository.findByCode(typeCode).orElse(null);
        if (type == null) {
            log.warn("Notification Type not found: {}", typeCode);
            return;
        }

        List<NotificationTypeChannel> routes = routingRepository.findActiveRoutesByType(type);
        if (routes.isEmpty()) {
            log.warn("No active routes found for notification type: {}", typeCode);
            return;
        }

        for (NotificationTypeChannel route : routes) {
            if (route.getChannel().getType() == ChannelType.IN_APP && route.getRecipientGroup() != null) {
                RecipientGroup group = route.getRecipientGroup();
                
                // If the group is defined by a role code, resolve all active staff with that role
                if (group.getRoleCode() != null && !group.getRoleCode().isEmpty()) {
                    String roleName = group.getRoleCode().replace("ROLE_", "");
                    List<String> targetRoles = new ArrayList<>();
                    targetRoles.add(roleName);
                    
                    // Business rule: Functional alerts should escalte to management
                    if ("MANAGER".equals(roleName) || "ROLE_MANAGEMENT".equals(group.getRoleCode())) {
                        targetRoles = List.of("OWNER", "MANAGER", "GENERAL_MANAGER");
                    } else if ("HOST".equals(roleName) || "BUSSER".equals(roleName)) {
                        targetRoles = List.of(roleName, "OWNER", "MANAGER", "GENERAL_MANAGER");
                    } else if ("SERVER_ALL".equals(roleName)) {
                        targetRoles = List.of("SENIOR_SERVER", "JUNIOR_SERVER", "SERVER");
                    }

                    log.info("Expanding recipient group {} to roles: {}", group.getRoleCode(), targetRoles);

                    for (String role : targetRoles) {
                        List<StaffMember> staffMembers = staffRepository.findByRoleName(role);
                        log.debug("Found {} members for role {}", staffMembers.size(), role);
                        for (StaffMember staff : staffMembers) {
                            if (staff.isActive()) {
                                sendToUser(staff.getId(), typeCode, title, body, data, correlationId);
                            }
                        }
                    }
                } 
                // Otherwise, use the explicit static members defined in the group
                else {
                    for (Recipient recipient : group.getMembers()) {
                        if (recipient.isActive() && recipient.getUserId() != null) {
                            sendToUser(recipient.getUserId(), typeCode, title, body, data, correlationId);
                        }
                    }
                }
            }
        }
    }

    @Override
    public void dispatchManualNotification(NotificationManualTriggerRequest request) {
        log.info("Manual notification dispatch triggered: type={}, group={}, user={}", 
            request.getTypeCode(), request.getRecipientGroup(), request.getRecipientId());

        Map<String, Object> data;
        try {
            data = objectMapper.readValue(request.getPayload(), new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.error("Failed to parse notification payload: {}", request.getPayload(), e);
            data = Map.of("rawPayload", request.getPayload());
        }

        String title = (String) data.getOrDefault("title", "Manual Notification");
        String message = (String) data.getOrDefault("message", "No message content provided.");

        if (request.getRecipientId() != null) {
            // Send to specific user
            sendToUser(request.getRecipientId(), request.getTypeCode(), title, message, data, null);
        } else if (request.getRecipientGroup() != null && !request.getRecipientGroup().isEmpty()) {
            // Resolve group and send
            List<StaffMember> targetStaff;
            switch (request.getRecipientGroup()) {
                case "BROADCAST":
                    targetStaff = staffRepository.findByActiveTrue();
                    break;
                case "MANAGERS":
                    // Owners, GM, and Managers
                    targetStaff = staffRepository.findByActiveTrue().stream()
                        .filter(s -> List.of("OWNER", "MANAGER", "GENERAL_MANAGER").contains(s.getRole().getName()))
                        .collect(Collectors.toList());
                    break;
                case "SERVERS":
                    targetStaff = staffRepository.findByActiveTrue().stream()
                        .filter(s -> List.of("SENIOR_SERVER", "JUNIOR_SERVER", "SERVER").contains(s.getRole().getName()))
                        .collect(Collectors.toList());
                    break;
                default:
                    log.warn("Unknown recipient group: {}", request.getRecipientGroup());
                    return;
            }

            for (StaffMember staff : targetStaff) {
                sendToUser(staff.getId(), request.getTypeCode(), title, message, data, null);
            }
        } else {
            // No recipient specified, use the predefined routing rules for the notification type
            log.info("No recipient specified for manual dispatch, using system-default routing for type: {}", request.getTypeCode());
            sendNotification(request.getTypeCode(), title, message, data, null);
        }
    }

    private void sendToUser(UUID userId, String typeCode, String title, String body, 
                           Map<String, Object> data, String correlationId) {
        InAppNotification notification = new InAppNotification();
        notification.setRecipientId(userId);
        notification.setTypeCode(typeCode);
        notification.setTitle(title);
        notification.setBody(body);
        notification.setData(data);
        notification.setCorrelationId(correlationId);
        notification.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));

        inAppRepository.save(notification);
        
        messagingTemplate.convertAndSendToUser(
                userId.toString(), 
                "/queue/notifications", 
                notification);
    }

    @Override
    public void recallNotification(String correlationId, UUID userId) {
        if (correlationId == null || correlationId.isEmpty() || userId == null) return;
        
        inAppRepository.dismissByCorrelationId(correlationId, userId);
        
        // Broadcast WS_CANCEL to clear from active UI instantly
        messagingTemplate.convertAndSendToUser(
                userId.toString(), 
                "/queue/notifications/sync", 
                Map.of("correlationId", correlationId, "action", "CANCEL"));
    }

    @Override
    public void markAsRead(UUID notificationId) {
        inAppRepository.markAsRead(notificationId);
        
        InAppNotification notification = inAppRepository.findById(notificationId).orElse(null);
        if (notification != null) {
            messagingTemplate.convertAndSendToUser(
                    notification.getRecipientId().toString(), 
                    "/queue/notifications/sync", 
                    Map.of("id", notificationId, "action", "READ"));
        }
    }

    @Override
    public void markAsDismissed(UUID notificationId) {
        inAppRepository.markAsDismissed(notificationId);
        
        InAppNotification notification = inAppRepository.findById(notificationId).orElse(null);
        if (notification != null) {
            messagingTemplate.convertAndSendToUser(
                    notification.getRecipientId().toString(), 
                    "/queue/notifications/sync", 
                    Map.of("id", notificationId, "action", "DISMISSED"));
        }
    }
}
