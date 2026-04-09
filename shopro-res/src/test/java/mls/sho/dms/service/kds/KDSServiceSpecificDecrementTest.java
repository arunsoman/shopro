package mls.sho.dms.service.kds;

import mls.sho.dms.application.mapper.KDSMapper;
import mls.sho.dms.entity.kds.KDSTicket;
import mls.sho.dms.entity.kds.KDSTicketItem;
import mls.sho.dms.entity.kds.KDSItemStatus;
import mls.sho.dms.entity.kds.KDSStation;
import mls.sho.dms.entity.order.OrderItem;
import mls.sho.dms.repository.kds.KDSTicketItemRepository;
import mls.sho.dms.repository.kds.KDSTicketRepository;
import mls.sho.dms.repository.kds.KDSStationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

public class KDSServiceSpecificDecrementTest {

    @Mock private KDSTicketItemRepository ticketItemRepository;
    @Mock private KDSTicketRepository ticketRepository;
    @Mock private KDSStationRepository stationRepository;
    @Mock private SimpMessagingTemplate messagingTemplate;
    @Mock private KDSMapper kdsMapper;

    @InjectMocks
    private KDSService kdsService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testDecrementSpecificUnitRemovesTicketIfEmpty() {
        UUID itemId = UUID.randomUUID();
        UUID ticketId = UUID.randomUUID();
        UUID stationId = UUID.randomUUID();
        int unitIndex = 3;

        KDSStation station = new KDSStation();
        station.setId(stationId);

        KDSTicket ticket = new KDSTicket();
        ticket.setId(ticketId);
        ticket.setStation(station);

        OrderItem orderItem = new OrderItem();
        orderItem.setId(itemId);

        KDSTicketItem item = new KDSTicketItem();
        item.setKdsTicket(ticket);
        item.setOrderItem(orderItem);
        item.setUnitIndex(unitIndex);
        item.setStatus(KDSItemStatus.PENDING);

        // 1. Setup repository returns
        when(ticketItemRepository.findByOrderItem_Id(itemId)).thenReturn(List.of(item));
        when(ticketItemRepository.countByKdsTicket_Id(ticketId)).thenReturn(0L); // Empty after deletion

        // 2. Execute
        kdsService.decrementSpecificUnit(itemId, unitIndex);

        // 3. Verify deletion of item
        verify(ticketItemRepository).deleteAll(argThat(iterable -> {
            List<KDSTicketItem> list = (List<KDSTicketItem>) iterable;
            return list.contains(item);
        }));

        // 4. Verify cleanup of ticket
        verify(ticketRepository).delete(ticket);

        // 5. Verify TICKET_CANCELLED broadcast
        verify(messagingTemplate).convertAndSend(eq("/topic/kds/station/" + stationId), (Object) argThat(payload -> 
            payload instanceof java.util.Map &&
            "TICKET_CANCELLED".equals(((java.util.Map)payload).get("type")) &&
            ticketId.equals(((java.util.Map)payload).get("ticketId"))
        ));
    }
}
