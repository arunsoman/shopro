package mls.sho.mplace.repository;

import mls.sho.mplace.entity.TicketMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface TicketMessageRepository extends JpaRepository<TicketMessage, UUID> {
    List<TicketMessage> findAllByTicketIdOrderBySentAtAsc(UUID ticketId);
}
