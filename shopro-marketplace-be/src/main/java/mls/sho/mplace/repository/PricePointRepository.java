package mls.sho.mplace.repository;

import mls.sho.mplace.entity.PricePoint;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PricePointRepository extends JpaRepository<PricePoint, Long> {
    Optional<PricePoint> findTopByFoodIdOrderByEffectiveFromDesc(Integer foodId);
}
