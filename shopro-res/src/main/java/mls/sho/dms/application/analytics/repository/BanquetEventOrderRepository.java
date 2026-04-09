package mls.sho.dms.application.analytics.repository;

import mls.sho.dms.entity.BanquetEventOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/** Repository for banquet/catering event orders, scoped by restaurant. */
@Repository
public interface BanquetEventOrderRepository extends JpaRepository<BanquetEventOrder, Long> {

    List<BanquetEventOrder> findAllByRestaurantIdAndEventStartBetween(
            Long restaurantId, LocalDateTime start, LocalDateTime end);
}
