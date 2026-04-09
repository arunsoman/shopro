package mls.sho.dms.application.kds.service;

import mls.sho.dms.application.kds.dto.KdsDtos;
import mls.sho.dms.application.kds.dto.KdsDtos.*;
import mls.sho.dms.application.kds.entity.*;
import mls.sho.dms.application.kds.event.KdsQueueChangedEvent;
import mls.sho.dms.application.kds.event.PosTicketReadyEvent;
import mls.sho.dms.application.kds.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class StationKdsServiceTest {

    @Mock private KdsTicketRepository ticketRepository;
    @Mock private KdsTicketItemRepository ticketItemRepository;
    @Mock private StationTicketItemRepository stationTicketItemRepository;
    @Mock private KdsStationRepository stationRepository;
    @Mock private KdsDeviceRepository deviceRepository;
    @Mock private KdsSettingsRepository settingsRepository;
    @Mock private KdsEventLogRepository eventLogRepository;
    @Mock private ApplicationEventPublisher eventPublisher;
    @Mock private StringRedisTemplate redisTemplate;
    @Mock private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private StationKdsService stationKdsService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    void testGetQueuePage_RespectsDeviceLimits() {
        // Arrange
        Long stationId = 1L;
        Long deviceId = 101L;
        KdsStation station = KdsStation.builder().id(stationId).outletId(1L).build();
        KdsDevice device = KdsDevice.builder().id(deviceId).deviceType(KdsDevice.DeviceType.PHONE).build(); // Phone = 2 limit
        
        List<StationTicketItem> items = new ArrayList<>();
        KdsTicket ticket = KdsTicket.builder().id(1L).ticketNumber("T1").firedAt(LocalDateTime.now()).priority(KdsTicket.Priority.NORMAL).source(KdsTicket.Source.POS).build();
        KdsTicketItem ti = KdsTicketItem.builder().id(1L).ticket(ticket).menuItemName("Burger").quantity(1).build();
        items.add(StationTicketItem.builder().id(1L).ticketItem(ti).station(station).status(StationTicketItem.StationItemStatus.NEW).build());

        when(stationRepository.findById(stationId)).thenReturn(Optional.of(station));
        when(deviceRepository.findById(deviceId)).thenReturn(Optional.of(device));
        when(stationTicketItemRepository.findByStationIdAndStatusIn(anyLong(), anyList())).thenReturn(items);

        // Act
        StationQueuePageDto result = stationKdsService.getQueuePage(stationId, deviceId);

        // Assert
        assertEquals(1, result.getTickets().size());
        assertEquals(1, result.getTotalTicketsInQueue());
    }

    @Test
    void testStartItem_UpdatesStatusAndFiresEvent() {
        // Arrange
        Long stationId = 1L;
        Long siId = 500L;
        KdsStation station = KdsStation.builder().id(stationId).outletId(1L).build();
        KdsTicket ticket = KdsTicket.builder().id(1L).outletId(1L).build();
        KdsTicketItem ti = KdsTicketItem.builder().id(1L).ticket(ticket).menuItemName("Burger").build();
        StationTicketItem si = StationTicketItem.builder().id(siId).station(station).ticketItem(ti).status(StationTicketItem.StationItemStatus.NEW).build();

        when(stationTicketItemRepository.findById(siId)).thenReturn(Optional.of(si));

        // Act
        StationTicketItemDto result = stationKdsService.startItem(stationId, siId, 101L);

        // Assert
        assertEquals("IN_PROGRESS", result.getStatus());
        assertNotNull(si.getStartedAt());
        verify(stationTicketItemRepository).save(si);
        verify(eventPublisher).publishEvent(any(KdsQueueChangedEvent.class));
    }

    @Test
    void testBumpItem_CompletesTicketIfAllDone() {
        // Arrange
        Long stationId = 1L;
        Long siId = 500L;
        KdsStation station = KdsStation.builder().id(stationId).outletId(1L).build();
        KdsTicket ticket = KdsTicket.builder().id(1L).outletId(1L).firedAt(LocalDateTime.now().minusMinutes(10)).posOrderId(12345L).ticketNumber("T1").build();
        KdsTicketItem ti = KdsTicketItem.builder().id(1L).ticket(ticket).menuItemName("Burger").status(KdsTicketItem.ItemStatus.IN_PROGRESS).build();
        StationTicketItem si = StationTicketItem.builder().id(siId).station(station).ticketItem(ti).status(StationTicketItem.StationItemStatus.IN_PROGRESS).build();
        
        ti.setStationItems(List.of(si));
        ticket.setItems(List.of(ti));

        when(stationTicketItemRepository.findById(siId)).thenReturn(Optional.of(si));

        // Act
        BumpResultDto result = stationKdsService.bumpItem(stationId, siId, 101L);

        // Assert
        assertTrue(result.getTicketCompleted());
        assertEquals(KdsTicket.TicketStatus.COMPLETE, ticket.getStatus());
        assertNotNull(ticket.getCompletedAt());
        verify(eventPublisher).publishEvent(any(PosTicketReadyEvent.class));
        verify(eventPublisher).publishEvent(any(KdsQueueChangedEvent.class));
    }

    @Test
    void testRecallItem_FailsOutsideWindow() {
        // Arrange
        Long stationId = 1L;
        Long siId = 500L;
        KdsStation station = KdsStation.builder().id(stationId).outletId(1L).build();
        StationTicketItem si = StationTicketItem.builder()
                .id(siId)
                .station(station)
                .status(StationTicketItem.StationItemStatus.DONE)
                .bumpedAt(LocalDateTime.now().minusSeconds(70)) // > 60s
                .build();

        when(stationTicketItemRepository.findById(siId)).thenReturn(Optional.of(si));

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> 
            stationKdsService.recallItem(stationId, siId, 101L)
        );
        assertEquals("Recall window expired.", exception.getMessage());
    }

    @Test
    void testRecallItem_SuccessWithinWindow() {
        // Arrange
        Long stationId = 1L;
        Long siId = 500L;
        KdsStation station = KdsStation.builder().id(stationId).outletId(1L).build();
        KdsTicket ticket = KdsTicket.builder().id(1L).outletId(1L).status(KdsTicket.TicketStatus.COMPLETE).build();
        KdsTicketItem ti = KdsTicketItem.builder().id(1L).ticket(ticket).menuItemName("Burger").status(KdsTicketItem.ItemStatus.DONE).build();
        StationTicketItem si = StationTicketItem.builder()
                .id(siId)
                .station(station)
                .ticketItem(ti)
                .status(StationTicketItem.StationItemStatus.DONE)
                .bumpedAt(LocalDateTime.now().minusSeconds(10)) // < 60s
                .build();

        when(stationTicketItemRepository.findById(siId)).thenReturn(Optional.of(si));

        // Act
        RecallResultDto result = stationKdsService.recallItem(stationId, siId, 101L);

        // Assert
        assertEquals("RECALLED", result.getStatus());
        assertEquals(KdsTicket.TicketStatus.ACTIVE, ticket.getStatus());
        assertNull(ticket.getCompletedAt());
        verify(eventPublisher).publishEvent(any(KdsQueueChangedEvent.class));
    }
}
