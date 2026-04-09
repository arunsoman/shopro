package mls.sho.dms.repository.inventory;

import mls.sho.dms.entity.inventory.ingredient.DemandForecast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface DemandForecastRepository extends JpaRepository<DemandForecast, UUID> {
    List<DemandForecast> findAllByIngredientIdAndForecastDateBetween(UUID ingredientId, LocalDate start, LocalDate end);
}
