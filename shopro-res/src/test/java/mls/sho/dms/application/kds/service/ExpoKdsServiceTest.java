package mls.sho.dms.application.kds.service;

import mls.sho.dms.application.kds.dto.KdsDtos;
import mls.sho.dms.application.kds.dto.KdsDtos.*;
import mls.sho.dms.application.kds.entity.*;
import mls.sho.dms.application.kds.event.KdsQueueChangedEvent;
import mls.sho.dms.application.kds.repository.*;
import mls.sho.dms.application.kds.service.impl.KdsVoidServiceImpl;
import mls.sho.dms.application.kds.service.impl.TicketDispatchServiceImpl;
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

class ExpoKdsServiceTest {

    @Mock private KdsTicketRepository ticketRepository;
    @Mock private KdsTicketItemRepository ticketItemRepository;
    @Mock private StationTicketItemRepository stationTicketItemRepository;
    @Mock private KdsStationRepository stationRepository;
    @Mock private KdsDeviceRepository deviceRepository;
    @Mock private KdsSettingsRepository settingsRepository;
    @Mock private KdsEventLogRepository eventLogRepository;
    @Mock private OutletRepository outletRepository;
    @Mock private TicketDispatchService ticketDispatchService;
    @Mock private KdsVoidService voidService;
    @Mock private ApplicationEventPublisher eventPublisher;
    @Mock private StringRedisTemplate redisTemplate;
    @Mock private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private ExpoKdsService expoKdsService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    void testGetPassView_FiltersByOutlet() {
        // Arrange
        Long outletId = 1L;
        List<KdsTicket> tickets = new ArrayList<>();
        KdsTicket ticket = KdsTicket.builder().id(1L).outletId(outletId).ticketNumber("T1").firedAt(LocalDateTime.now()).priority(KdsTicket.Priority.NORMAL).status(KdsTicket.TicketStatus.ACTIVE).source(KdsTicket.Source.POS).build();
        ticket.setItems(new ArrayList<>());
        tickets.add(ticket);

        when(ticketRepository.findByOutletIdAndStatusIn(anyLong(), anyList())).thenReturn(tickets);

        // Act
        ExpoPassViewDto result = expoKdsService.getPassView(outletId);

        // Assert
        assertEquals(1, result.getTickets().size());
        assertEquals(outletId, result.getOutletId());
    }

    @Test
    void testFireManualTicket_CallsDispatchService() {
        // Arrange
        Long outletId = 1L;
        ManualTicketRequest req = new ManualTicketRequest();
        req.setItems(new ArrayList<>());
        KdsTicket ticket = KdsTicket.builder().id(1L).outletId(outletId).build();

        when(ticketDispatchService.createManualTicket(anyLong(), any())).thenReturn(ticket);

        // Act
        KdsTicket result = expoKdsService.fireManualTicket(outletId, req);

        // Assert
        assertEquals(ticket.getId(), result.getId());
        verify(ticketDispatchService).createManualTicket(outletId, req);
    }

    @Test
    void testMarkRush_UpdatesPriorityAndFiresEvent() {
        // Arrange
        Long ticketId = 1L;
        KdsTicket ticket = KdsTicket.builder().id(ticketId).outletId(1L).priority(KdsTicket.Priority.NORMAL).build();

        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(ticket));

        // Act
        expoKdsService.markRush(ticketId);

        // Assert
        assertEquals(KdsTicket.Priority.RUSH, ticket.getPriority());
        verify(ticketRepository).save(ticket);
        verify(eventPublisher).publishEvent(any(KdsQueueChangedEvent.class));
    }

    @Test
    void testVoidTicket_CallsVoidService() {
        // Arrange
        Long ticketId = 1L;
        String reason = "Customer left";
        Long actorId = 101L;

        // Act
        expoKdsService.voidTicket(ticketId, reason, actorId);

        // Assert
        verify(voidService).voidTicket(ticketId, reason, actorId);
    }
}
