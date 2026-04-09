package mls.sho.dms.repository.staff;

import mls.sho.dms.entity.staff.DeviceBinding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeviceBindingRepository extends JpaRepository<DeviceBinding, UUID> {
    List<DeviceBinding> findByStaffMemberId(UUID staffId);
    Optional<DeviceBinding> findByPublicKeyThumbprint(String thumbprint);
}
