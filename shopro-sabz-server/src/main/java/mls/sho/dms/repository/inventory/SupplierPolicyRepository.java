package mls.sho.dms.repository.inventory;

import mls.sho.dms.entity.inventory.SupplierPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SupplierPolicyRepository extends JpaRepository<SupplierPolicy, UUID> {
}
