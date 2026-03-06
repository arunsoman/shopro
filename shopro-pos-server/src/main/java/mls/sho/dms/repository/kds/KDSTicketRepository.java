package mls.sho.dms.repository.kds;

import mls.sho.dms.entity.kds.KDSTicket;
import mls.sho.dms.entity.kds.KDSTicketStatus;
import mls.sho.dms.entity.order.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface KDSTicketRepository extends JpaRepository<KDSTicket, UUID> {
    
    @Query("SELECT t FROM KDSTicket t WHERE t.station.id = :stationId AND t.status IN :statuses " +
           "AND t.orderTicket.status NOT IN :excludedStatuses ORDER BY t.firedAt ASC")
    List<KDSTicket> findActiveByStation(
            @Param("stationId") UUID stationId,
            @Param("statuses") List<KDSTicketStatus> statuses,
            @Param("excludedStatuses") List<TicketStatus> excludedStatuses
    );

    List<KDSTicket> findByStation_IdAndStatusInOrderByFiredAtAsc(UUID stationId, List<KDSTicketStatus> statuses);
    List<KDSTicket> findByOrderTicket_Id(UUID orderTicketId);
}
