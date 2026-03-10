package mls.sho.dms.repository.staff;

import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.entity.staff.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StaffRepository extends JpaRepository<StaffMember, UUID> {
    List<StaffMember> findByActiveTrue();
    List<StaffMember> findByRole(Role role);
    List<StaffMember> findByRoleName(String roleName);
    Optional<StaffMember> findByFullName(String fullName);
    Optional<StaffMember> findByIdAndActiveTrue(UUID id);
}
