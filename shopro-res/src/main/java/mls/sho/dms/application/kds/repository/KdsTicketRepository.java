package mls.sho.dms.application.kds.repository;

import mls.sho.dms.application.kds.entity.KdsTicket;
import mls.sho.dms.application.kds.entity.KdsTicket.TicketStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KdsTicketRepository extends JpaRepository<KdsTicket, Long> {
    List<KdsTicket> findByOutletIdAndStatusInOrderByPriorityDescFiredAtAsc(Long outletId, List<TicketStatus> statuses);

    @Query("SELECT t FROM KdsTicket t WHERE t.outletId = :outletId AND t.status = 'COMPLETE' ORDER BY t.completedAt DESC")
    List<KdsTicket> findRecentlyCompleted(Long outletId, Pageable pageable);

    long countByOutletIdAndStatus(Long outletId, TicketStatus status);
}
