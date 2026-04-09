package mls.sho.dms.repository.inventory;

import mls.sho.dms.entity.inventory.InventoryLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface InventoryLocationRepository extends JpaRepository<InventoryLocation, UUID> {
    boolean existsByNameIgnoreCase(String name);
}
