package mls.sho.mplace.repository;

import mls.sho.mplace.entity.ProcurementPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProcurementPolicyRepository extends JpaRepository<ProcurementPolicy, UUID> {
    java.util.Optional<ProcurementPolicy> findByType(ProcurementPolicy.PolicyType type);
}
