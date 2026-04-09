package mls.sho.dms.repository.inventory;

import mls.sho.dms.entity.inventory.vendor.SupplierUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SupplierUserRepository extends JpaRepository<SupplierUser, UUID> {
    Optional<SupplierUser> findByEmail(String email);
    List<SupplierUser> findBySupplierId(UUID supplierId);
}
