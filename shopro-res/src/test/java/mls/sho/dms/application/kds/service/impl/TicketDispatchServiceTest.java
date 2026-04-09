package mls.sho.dms.application.kds.service.impl;

import mls.sho.dms.application.kds.dto.KdsDtos.ManualTicketItemRequest;
import mls.sho.dms.application.kds.dto.KdsDtos.ManualTicketRequest;
import mls.sho.dms.application.kds.entity.*;
import mls.sho.dms.application.kds.event.KdsQueueChangedEvent;
import mls.sho.dms.application.kds.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.context.ApplicationEventPublisher;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class TicketDispatchServiceTest {

    @Mock private KdsTicketRepository ticketRepository;
    @Mock private KdsStationRepository stationRepository;
    @Mock private StationRoutingRepository routingRepository;
    @Mock private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private TicketDispatchServiceImpl ticketDispatchService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateManualTicket_RoutesToCorrectStation() {
        // Arrange
        Long outletId = 1L;
        ManualTicketRequest req = new ManualTicketRequest();
        req.setTicketNumber("M1");
        req.setItems(new ArrayList<>());
        
        ManualTicketItemRequest itemReq = new ManualTicketItemRequest();
        itemReq.setMenuItemName("Pizza");
        itemReq.setQuantity(1);
        itemReq.setCategory("Pizzas");
        req.getItems().add(itemReq);

        KdsStation station = KdsStation.builder().id(101L).build();
        StationRouting routing = StationRouting.builder()
                .routingType(StationRouting.RoutingType.CATEGORY)
                .routingKey("Pizzas")
                .station(station)
                .build();

        when(routingRepository.findByOutletId(outletId)).thenReturn(List.of(routing));
        when(ticketRepository.save(any(KdsTicket.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        KdsTicket result = ticketDispatchService.createManualTicket(outletId, req);

        // Assert
        assertEquals("M1", result.getTicketNumber());
        assertEquals(1, result.getItems().size());
        assertEquals(1, result.getItems().get(0).getStationItems().size());
        assertEquals(station.getId(), result.getItems().get(0).getStationItems().get(0).getStation().getId());
        verify(ticketRepository).save(any(KdsTicket.class));
        verify(eventPublisher).publishEvent(any(KdsQueueChangedEvent.class));
    }
}
