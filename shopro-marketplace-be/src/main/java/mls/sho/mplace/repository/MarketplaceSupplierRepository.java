package mls.sho.mplace.repository;

import mls.sho.mplace.entity.MarketplaceSupplier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MarketplaceSupplierRepository extends JpaRepository<MarketplaceSupplier, UUID> {
    Optional<MarketplaceSupplier> findByEmail(String email);
}
