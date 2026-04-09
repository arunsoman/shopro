package mls.sho.dms.application.users.repo;

import mls.sho.dms.entity.users.StaffCompensation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StaffCompensationRepository extends JpaRepository<StaffCompensation, UUID> {

    Optional<StaffCompensation> findByStaffStaffId(UUID staffId);

    Optional<StaffCompensation> findByStaffStaffIdAndRestaurantId(UUID staffId, Long restaurantId);
}
