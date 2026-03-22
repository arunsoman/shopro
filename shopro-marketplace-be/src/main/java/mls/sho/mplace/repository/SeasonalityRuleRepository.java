package mls.sho.mplace.repository;

import mls.sho.mplace.entity.SeasonalityRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface SeasonalityRuleRepository extends JpaRepository<SeasonalityRule, UUID> {
    List<SeasonalityRule> findAllByProduct_Id(UUID productId);
}
