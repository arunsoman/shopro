package mls.sho.dms.application.service.core.impl;

import mls.sho.dms.entity.notification.Channel;
import mls.sho.dms.entity.notification.ChannelType;
import mls.sho.dms.entity.notification.InAppNotification;
import mls.sho.dms.entity.notification.NotificationType;
import mls.sho.dms.entity.notification.NotificationTypeChannel;
import mls.sho.dms.entity.notification.Recipient;
import mls.sho.dms.entity.notification.RecipientGroup;
import mls.sho.dms.repository.notification.InAppNotificationRepository;
import mls.sho.dms.repository.notification.NotificationTypeChannelRepository;
import mls.sho.dms.repository.notification.NotificationTypeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationEngineImplTest {

    @Mock
    private InAppNotificationRepository inAppRepository;

    @Mock
    private NotificationTypeRepository typeRepository;

    @Mock
    private NotificationTypeChannelRepository routingRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private NotificationEngineImpl notificationEngine;

    private NotificationType mockType;
    private NotificationTypeChannel mockRoute;
    private UUID userId;

    @BeforeEach
    void setUp() {
        mockType = new NotificationType();
        mockType.setCode("TEST_ALERT");

        Channel inAppChannel = new Channel();
        inAppChannel.setType(ChannelType.IN_APP);

        Recipient recipient = new Recipient();
        userId = UUID.randomUUID();
        recipient.setUserId(userId);

        RecipientGroup group = new RecipientGroup();
        group.setRoleCode("ROLE_MANAGER");
        group.setMembers(Set.of(recipient));

        mockRoute = new NotificationTypeChannel();
        mockRoute.setNotificationType(mockType);
        mockRoute.setChannel(inAppChannel);
        mockRoute.setRecipientGroup(group);
    }

    @Test
    void sendNotification_ShouldSaveAndDispatch() {
        when(typeRepository.findByCode("TEST_ALERT")).thenReturn(Optional.of(mockType));
        when(routingRepository.findActiveRoutesByType(mockType)).thenReturn(List.of(mockRoute));

        notificationEngine.sendNotification(
                "TEST_ALERT",
                "Alert Title",
                "Alert Body",
                Map.of("key", "value"),
                "corr-123"
        );

        verify(inAppRepository, times(1)).save(any(InAppNotification.class));
        verify(messagingTemplate, times(1)).convertAndSendToUser(eq(userId.toString()), eq("/queue/notifications"), any(InAppNotification.class));
    }

    @Test
    void recallNotification_ShouldTriggerRecall() {
        UUID uId = UUID.randomUUID();
        notificationEngine.recallNotification("corr-123", uId);

        verify(inAppRepository).dismissByCorrelationId("corr-123", uId);
        verify(messagingTemplate).convertAndSendToUser(eq(uId.toString()), eq("/queue/notifications/sync"), any(Map.class));
    }

    @Test
    void markAsRead_ShouldUpdateAndSync() {
        UUID id = UUID.randomUUID();
        InAppNotification notification = new InAppNotification();
        notification.setId(id);
        notification.setRecipientId(userId);

        when(inAppRepository.findById(id)).thenReturn(Optional.of(notification));

        notificationEngine.markAsRead(id);

        verify(inAppRepository).markAsRead(id);
        verify(messagingTemplate).convertAndSendToUser(eq(userId.toString()), eq("/queue/notifications/sync"), any(Map.class));
    }

    @Test
    void markAsDismissed_ShouldUpdateAndSync() {
        UUID id = UUID.randomUUID();
        InAppNotification notification = new InAppNotification();
        notification.setId(id);
        notification.setRecipientId(userId);

        when(inAppRepository.findById(id)).thenReturn(Optional.of(notification));

        notificationEngine.markAsDismissed(id);

        verify(inAppRepository).markAsDismissed(id);
        verify(messagingTemplate).convertAndSendToUser(eq(userId.toString()), eq("/queue/notifications/sync"), any(Map.class));
    }
}
