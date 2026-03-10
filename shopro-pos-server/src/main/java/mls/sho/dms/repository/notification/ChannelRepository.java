package mls.sho.dms.repository.notification;

import mls.sho.dms.entity.notification.Channel;
import mls.sho.dms.entity.notification.ChannelType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChannelRepository extends JpaRepository<Channel, UUID> {
    List<Channel> findByTypeAndIsActiveTrue(ChannelType type);
}
