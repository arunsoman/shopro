package mls.sho.dms.application.users.repo;

import mls.sho.dms.entity.users.Guest;
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
public interface GuestRepository extends JpaRepository<Guest, UUID> {
    
    Optional<Guest> findByEmailAndIsActiveTrue(String email);
    
    Optional<Guest> findByGuestIdAndIsActiveTrue(UUID guestId);
    
    boolean existsByEmail(String email);
    
    @Query("SELECT g FROM Guest g LEFT JOIN FETCH g.oauthAccounts WHERE g.guestId = :guestId")
    Optional<Guest> findByIdWithOAuthAccounts(@Param("guestId") UUID guestId);
}
