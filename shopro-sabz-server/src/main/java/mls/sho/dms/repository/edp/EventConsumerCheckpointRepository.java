package mls.sho.dms.repository.edp;

import mls.sho.dms.entity.edp.EventConsumerCheckpoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventConsumerCheckpointRepository extends JpaRepository<EventConsumerCheckpoint, String> {
}
