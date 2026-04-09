package mls.sho.dms.repository.kds;

import mls.sho.dms.entity.kds.KDSRoutingRule;
import mls.sho.dms.entity.kds.RoutingTargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface KDSRoutingRuleRepository extends JpaRepository<KDSRoutingRule, UUID> {
    List<KDSRoutingRule> findByTargetTypeAndTargetId(RoutingTargetType type, UUID targetId);
    List<KDSRoutingRule> findByStation_Id(UUID stationId);
    void deleteByStation_Id(UUID stationId);
}
