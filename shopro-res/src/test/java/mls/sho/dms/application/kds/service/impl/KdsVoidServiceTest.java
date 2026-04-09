package mls.sho.dms.application.kds.service.impl;

import mls.sho.dms.application.kds.entity.*;
import mls.sho.dms.application.kds.event.KdsQueueChangedEvent;
import mls.sho.dms.application.kds.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class KdsVoidServiceTest {

    @Mock private KdsTicketRepository ticketRepository;
    @Mock private KdsTicketItemRepository ticketItemRepository;
    @Mock private StationTicketItemRepository stationTicketItemRepository;
    @Mock private KdsEventLogRepository eventLogRepository;
    @Mock private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private KdsVoidServiceImpl kdsVoidService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testVoidItem_UpdatesStatusAndFiresEvent() {
        // Arrange
        Long itemId = 1L;
        KdsTicket ticket = KdsTicket.builder().id(101L).outletId(1L).build();
        KdsTicketItem item = KdsTicketItem.builder().id(itemId).ticket(ticket).status(KdsTicketItem.ItemStatus.IN_PROGRESS).build();
        StationTicketItem si = StationTicketItem.builder().id(201L).status(StationTicketItem.StationItemStatus.IN_PROGRESS).ticketItem(item).build();
        item.setStationItems(List.of(si));

        when(ticketItemRepository.findById(itemId)).thenReturn(Optional.of(item));

        // Act
        kdsVoidService.voidItem(itemId, "Customer left", 501L);

        // Assert
        assertEquals(KdsTicketItem.ItemStatus.VOIDED, item.getStatus());
        assertEquals(StationTicketItem.StationItemStatus.VOIDED, si.getStatus());
        verify(ticketItemRepository).save(item);
        verify(eventPublisher).publishEvent(any(KdsQueueChangedEvent.class));
    }

    @Test
    void testVoidTicket_VoidsAllItems() {
        // Arrange
        Long ticketId = 101L;
        KdsTicket ticket = KdsTicket.builder().id(ticketId).outletId(1L).status(KdsTicket.TicketStatus.ACTIVE).build();
        KdsTicketItem item1 = KdsTicketItem.builder().id(1L).ticket(ticket).status(KdsTicketItem.ItemStatus.IN_PROGRESS).build();
        KdsTicketItem item2 = KdsTicketItem.builder().id(2L).ticket(ticket).status(KdsTicketItem.ItemStatus.IN_PROGRESS).build();
        ticket.setItems(List.of(item1, item2));

        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(ticket));

        // Act
        kdsVoidService.voidTicket(ticketId, "Ticket voided", 501L);

        // Assert
        assertEquals(KdsTicket.TicketStatus.VOIDED, ticket.getStatus());
        assertEquals(KdsTicketItem.ItemStatus.VOIDED, item1.getStatus());
        assertEquals(KdsTicketItem.ItemStatus.VOIDED, item2.getStatus());
        verify(ticketRepository).save(ticket);
    }
}
