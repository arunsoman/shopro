package mls.sho.dms.application.kds.repository;

import mls.sho.dms.application.kds.entity.StationTicketItem;
import mls.sho.dms.application.kds.entity.StationTicketItem.StationItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StationTicketItemRepository extends JpaRepository<StationTicketItem, Long> {
    List<StationTicketItem> findByTicketItemTicketOutletIdAndStatusNot(Long outletId, StationItemStatus status);
    List<StationTicketItem> findByTicketItemTicketId(Long ticketId);
    List<StationTicketItem> findByStationIdAndStatusNot(Long stationId, StationItemStatus status);
    List<StationTicketItem> findByStationIdAndStatusIn(Long stationId, List<StationItemStatus> statuses);
    List<StationTicketItem> findByStationIdAndTicketItemTicketId(Long stationId, Long ticketId);
}
