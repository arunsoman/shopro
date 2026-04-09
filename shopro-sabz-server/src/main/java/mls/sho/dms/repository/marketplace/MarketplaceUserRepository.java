package mls.sho.dms.repository.marketplace;

import mls.sho.dms.entity.marketplace.MarketplaceUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MarketplaceUserRepository extends JpaRepository<MarketplaceUser, UUID> {
    Optional<MarketplaceUser> findByUsername(String username);
    Optional<MarketplaceUser> findByEmail(String email);
}
