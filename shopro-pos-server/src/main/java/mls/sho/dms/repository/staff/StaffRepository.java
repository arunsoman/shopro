package mls.sho.dms.repository.staff;

import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.entity.staff.StaffRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StaffRepository extends JpaRepository<StaffMember, UUID> {
    List<StaffMember> findByActiveTrue();
    List<StaffMember> findByRole(StaffRole role);
    List<StaffMember> findByRoleAndActiveTrue(StaffRole role);
    Optional<StaffMember> findByIdAndActiveTrue(UUID id);
}
