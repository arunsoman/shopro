package mls.sho.dms.repository.guest;

import mls.sho.dms.entity.guest.GuestUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GuestUserRepository extends JpaRepository<GuestUser, UUID> {
    
    Optional<GuestUser> findByEmail(String email);
    
    Optional<GuestUser> findByPhoneNumber(String phoneNumber);
    
    Optional<GuestUser> findBySsoProviderAndSsoId(String ssoProvider, String ssoId);
    
    Optional<GuestUser> findBySsoId(String ssoId);
    
    boolean existsByEmail(String email);
    
    boolean existsByPhoneNumber(String phoneNumber);
}
