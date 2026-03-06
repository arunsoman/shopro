package mls.sho.dms.repository.staff;

import mls.sho.dms.entity.staff.StaffMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StaffMemberRepository extends JpaRepository<StaffMember, UUID> {
    Optional<StaffMember> findByFullName(String fullName);
}
