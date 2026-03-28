package mls.sho.dms.repository.finance;

import mls.sho.dms.entity.finance.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, UUID> {
    List<JournalEntry> findByEntryDateBetweenOrderByEntryDateDesc(Instant start, Instant end);
    List<JournalEntry> findByReferenceId(UUID referenceId);
}
