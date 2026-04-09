package mls.sho.dms.application.users.repo;

import mls.sho.dms.entity.users.ShoProUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShoProUserRepository extends JpaRepository<ShoProUser, UUID> {
    
    Optional<ShoProUser> findByUsernameAndIsActiveTrue(String username);
    
    Optional<ShoProUser> findByEmailAndIsActiveTrue(String email);

    Optional<ShoProUser> findByEmail(String email);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    @Modifying
    @Query("UPDATE ShoProUser s SET s.failedLoginAttempts = s.failedLoginAttempts + 1 WHERE s.shoproId = :shoproId")
    void incrementFailedAttempts(@Param("shoproId") UUID shoproId);
    
    @Modifying
    @Query("UPDATE ShoProUser s SET s.failedLoginAttempts = 0, s.lockedUntil = null WHERE s.shoproId = :shoproId")
    void resetFailedAttempts(@Param("shoproId") UUID shoproId);
}