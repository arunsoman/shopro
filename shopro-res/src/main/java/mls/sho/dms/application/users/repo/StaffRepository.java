package mls.sho.dms.application.users.repo;

import mls.sho.dms.entity.users.Staff;
import mls.sho.dms.entity.users.StaffRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StaffRepository extends JpaRepository<Staff, UUID> {
    
    Optional<Staff> findByStaffIdAndRestaurantIdAndIsActiveTrue(UUID staffId, Long restaurantId);
    
    List<Staff> findByRestaurantIdAndIsActiveTrue(Long restaurantId);
    
    List<Staff> findByRestaurantIdAndShiftActiveTrue(Long restaurantId);
    
    @Query("SELECT s FROM Staff s WHERE s.restaurantId = :restaurantId AND s.isActive = true AND s.role = :role")
    List<Staff> findActiveByRestaurantAndRole(@Param("restaurantId") Long restaurantId, @Param("role") StaffRole role);
    
    @Modifying
    @Query("UPDATE Staff s SET s.failedPinAttempts = s.failedPinAttempts + 1 WHERE s.staffId = :staffId")
    void incrementFailedAttempts(@Param("staffId") UUID staffId);
    
    @Modifying
    @Query("UPDATE Staff s SET s.failedPinAttempts = 0, s.lockedUntil = null WHERE s.staffId = :staffId")
    void resetFailedAttempts(@Param("staffId") UUID staffId);
}