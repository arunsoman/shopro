package mls.sho.dms.repository.notification;

import mls.sho.dms.entity.notification.RecipientGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecipientGroupRepository extends JpaRepository<RecipientGroup, UUID> {
    Optional<RecipientGroup> findByRoleCode(String roleCode);
}
