package mls.sho.dms.application.kds.repository;

import mls.sho.dms.application.kds.entity.KdsEventLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KdsEventLogRepository extends JpaRepository<KdsEventLog, Long> {
    List<KdsEventLog> findByTicketId(Long ticketId);
    List<KdsEventLog> findByOutletId(Long outletId);
}
