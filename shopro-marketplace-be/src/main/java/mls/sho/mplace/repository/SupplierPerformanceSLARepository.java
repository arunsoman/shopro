package mls.sho.mplace.repository;

import mls.sho.mplace.entity.SupplierPerformanceSLA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface SupplierPerformanceSLARepository extends JpaRepository<SupplierPerformanceSLA, UUID> {
    Optional<SupplierPerformanceSLA> findBySupplier_Id(UUID supplierId);
}
