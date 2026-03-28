package mls.sho.dms.repository.finance;

import mls.sho.dms.entity.finance.JournalLine;
import mls.sho.dms.entity.finance.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JournalLineRepository extends JpaRepository<JournalLine, UUID> {
    List<JournalLine> findByAccountOrderByCreatedAtDesc(Account account);
}
