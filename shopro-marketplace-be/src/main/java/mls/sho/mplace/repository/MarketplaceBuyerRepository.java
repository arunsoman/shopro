package mls.sho.mplace.repository;

import mls.sho.mplace.entity.MarketplaceBuyer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MarketplaceBuyerRepository extends JpaRepository<MarketplaceBuyer, UUID> {
    Optional<MarketplaceBuyer> findByEmail(String email);
}
