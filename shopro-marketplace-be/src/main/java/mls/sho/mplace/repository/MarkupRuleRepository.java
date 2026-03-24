package mls.sho.mplace.repository;

import mls.sho.mplace.entity.MarkupRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MarkupRuleRepository extends JpaRepository<MarkupRule, UUID> {

    @Query("SELECT r FROM MarkupRule r WHERE r.isActive = true ORDER BY r.priority DESC")
    List<MarkupRule> findAllActiveOrderedByPriority();

    /**
     * Resolves the best markup rule for a given food context.
     * Item (4) > Subgroup (3) > Group (2) > Global (1)
     */
    @Query("SELECT r FROM MarkupRule r WHERE r.isActive = true AND (" +
           "(r.targetType = 'ITEM' AND r.targetValue = :foodId) OR " +
           "(r.targetType = 'SUBGROUP' AND r.targetValue = :group AND r.subgroupValue = :subgroup) OR " +
           "(r.targetType = 'GROUP' AND r.targetValue = :group) OR " +
           "(r.targetType = 'GLOBAL')" +
           ") ORDER BY r.priority DESC")
    List<MarkupRule> findApplicableRules(
        @Param("foodId") String foodId,
        @Param("group") String group,
        @Param("subgroup") String subgroup
    );
}
