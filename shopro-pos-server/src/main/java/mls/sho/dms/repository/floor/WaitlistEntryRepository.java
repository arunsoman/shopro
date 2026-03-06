package mls.sho.dms.repository.floor;

import mls.sho.dms.entity.floor.WaitlistEntry;
import mls.sho.dms.entity.floor.WaitlistStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface WaitlistEntryRepository extends JpaRepository<WaitlistEntry, UUID> {

    List<WaitlistEntry> findByStatusOrderByCreatedAtAsc(WaitlistStatus status);

    List<WaitlistEntry> findByCreatedAtAfterOrderByCreatedAtAsc(Instant since);
    
    long countByStatusAndPartySize(WaitlistStatus status, int partySize);
}
