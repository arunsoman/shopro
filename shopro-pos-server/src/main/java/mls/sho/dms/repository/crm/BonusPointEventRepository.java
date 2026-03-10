package mls.sho.dms.repository.crm;

import mls.sho.dms.entity.crm.BonusPointEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface BonusPointEventRepository extends JpaRepository<BonusPointEvent, UUID> {
    
    @Query("SELECT b FROM BonusPointEvent b WHERE b.isActive = true AND b.startsAt <= :now AND b.endsAt >= :now")
    List<BonusPointEvent> findActiveEventsAtTime(@Param("now") Instant now);
}
