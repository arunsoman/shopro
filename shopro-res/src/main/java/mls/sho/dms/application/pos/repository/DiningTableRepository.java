package mls.sho.dms.application.pos.repository;

import mls.sho.dms.entity.DiningTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DiningTableRepository extends JpaRepository<DiningTable, Long> {
    List<DiningTable> findAllByRestaurantId(Long restaurantId);
    List<DiningTable> findAllByRestaurantIdAndStatus(Long restaurantId, DiningTable.TableStatus status);
    List<DiningTable> findAllByRestaurantIdAndStatusAndCapacityGreaterThanEqual(Long restaurantId, DiningTable.TableStatus status, Integer capacity);
}
