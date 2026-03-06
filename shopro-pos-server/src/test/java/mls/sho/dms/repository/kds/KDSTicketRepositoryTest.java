package mls.sho.dms.repository.kds;

import mls.sho.dms.entity.kds.KDSStation;
import mls.sho.dms.entity.kds.KDSStationType;
import mls.sho.dms.entity.kds.KDSTicket;
import mls.sho.dms.entity.kds.KDSTicketStatus;
import mls.sho.dms.entity.order.OrderTicket;
import mls.sho.dms.entity.order.OrderType;
import mls.sho.dms.repository.order.OrderTicketRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class KDSTicketRepositoryTest {

    @Autowired
    private KDSTicketRepository kdsTicketRepository;

    @Autowired
    private KDSStationRepository kdsStationRepository;

    @Autowired
    private OrderTicketRepository orderTicketRepository;

    @Test
    void shouldFindActiveTicketsForStationOrderedByFiredAt() {
        // Given
        KDSStation station = new KDSStation();
        station.setName("Test Station");
        station.setStationType(KDSStationType.PREP);
        station = kdsStationRepository.save(station);

        OrderTicket orderTicket = new OrderTicket();
        orderTicket.setOrderType(OrderType.DINE_IN);
        orderTicket = orderTicketRepository.save(orderTicket);

        KDSTicket ticket1 = new KDSTicket();
        ticket1.setStation(station);
        ticket1.setOrderTicket(orderTicket);
        ticket1.setFiredAt(Instant.now().minusSeconds(600)); // 10 mins ago
        ticket1.setStatus(KDSTicketStatus.NEW);
        kdsTicketRepository.save(ticket1);

        KDSTicket ticket2 = new KDSTicket();
        ticket2.setStation(station);
        ticket2.setOrderTicket(orderTicket);
        ticket2.setFiredAt(Instant.now().minusSeconds(1200)); // 20 mins ago
        ticket2.setStatus(KDSTicketStatus.COOKING);
        kdsTicketRepository.save(ticket2);

        KDSTicket ticket3 = new KDSTicket();
        ticket3.setStation(station);
        ticket3.setOrderTicket(orderTicket);
        ticket3.setFiredAt(Instant.now());
        ticket3.setStatus(KDSTicketStatus.READY); // Not active
        kdsTicketRepository.save(ticket3);

        // When
        List<KDSTicket> activeTickets = kdsTicketRepository.findByStation_IdAndStatusInOrderByFiredAtAsc(
                station.getId(),
                Arrays.asList(KDSTicketStatus.NEW, KDSTicketStatus.COOKING)
        );

        // Then
        assertThat(activeTickets).hasSize(2);
        // ticket2 was fired earlier than ticket1
        assertThat(activeTickets.get(0).getId()).isEqualTo(ticket2.getId());
        assertThat(activeTickets.get(1).getId()).isEqualTo(ticket1.getId());
    }
}
