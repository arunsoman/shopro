package mls.sho.mplace.repository;

import mls.sho.mplace.entity.AutoReorderRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface AutoReorderRuleRepository extends JpaRepository<AutoReorderRule, UUID> {
    List<AutoReorderRule> findAllByRestaurant_Id(UUID restaurantId);
}
