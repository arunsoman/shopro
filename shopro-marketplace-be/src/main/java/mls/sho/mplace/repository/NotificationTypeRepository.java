package mls.sho.mplace.repository;

import mls.sho.mplace.entity.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationTypeRepository extends JpaRepository<NotificationType, UUID> {
    Optional<NotificationType> findByCode(String code);
}
