package mls.sho.dms.application.users.repo;


import mls.sho.dms.entity.users.GuestOAuthAccount;
import mls.sho.dms.entity.users.OAuthProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GuestOAuthAccountRepository extends JpaRepository<GuestOAuthAccount, UUID> {

    Optional<GuestOAuthAccount> findByProviderAndProviderSubject(OAuthProvider provider, String providerSubject);

    List<GuestOAuthAccount> findByGuestGuestId(UUID guestId);

    boolean existsByGuestGuestIdAndProvider(UUID guestId, OAuthProvider provider);

    @Modifying
    @Query("DELETE FROM GuestOAuthAccount g WHERE g.guest.guestId = :guestId AND g.provider = :provider")
    void deleteByGuestAndProvider(@Param("guestId") UUID guestId, @Param("provider") OAuthProvider provider);
}