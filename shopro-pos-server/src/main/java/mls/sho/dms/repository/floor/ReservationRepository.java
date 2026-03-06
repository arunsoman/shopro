package mls.sho.dms.repository.floor;

import mls.sho.dms.entity.floor.Reservation;
import mls.sho.dms.entity.floor.ReservationStatus;
import mls.sho.dms.entity.floor.TableShape;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

    @Query("SELECT r FROM Reservation r JOIN FETCH r.table WHERE r.table = :table AND r.reservationTime >= :start AND r.status IN :statuses ORDER BY r.reservationTime ASC")
    List<Reservation> findUpcomingByTable(
        @Param("table") TableShape table,
        @Param("start") Instant start, 
        @Param("statuses") List<ReservationStatus> statuses
    );

    @Query("SELECT r FROM Reservation r JOIN FETCH r.table WHERE r.reservationTime BETWEEN :start AND :end ORDER BY r.reservationTime ASC")
    List<Reservation> findByTimeRange(@Param("start") Instant start, @Param("end") Instant end);
    
    @Query("SELECT r FROM Reservation r JOIN FETCH r.table WHERE r.reservationTime >= :start AND r.status = :status ORDER BY r.reservationTime ASC")
    List<Reservation> findUpcomingByStatus(@Param("start") Instant start, @Param("status") ReservationStatus status);
}
