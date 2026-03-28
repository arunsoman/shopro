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

    @org.springframework.data.jpa.repository.Query("SELECT SUM(l.debitAmount - l.creditAmount) FROM JournalLine l WHERE l.account = :account AND l.entry.entryDate BETWEEN :from AND :to")
    java.math.BigDecimal sumAmountByAccountAndDate(
        @org.springframework.data.repository.query.Param("account") Account account, 
        @org.springframework.data.repository.query.Param("from") java.time.Instant from, 
        @org.springframework.data.repository.query.Param("to") java.time.Instant to
    );
}
