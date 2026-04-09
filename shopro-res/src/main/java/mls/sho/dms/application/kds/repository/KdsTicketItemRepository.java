package mls.sho.dms.application.kds.repository;

import mls.sho.dms.application.kds.entity.KdsTicketItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KdsTicketItemRepository extends JpaRepository<KdsTicketItem, Long> {
    List<KdsTicketItem> findByTicketId(Long ticketId);
}
