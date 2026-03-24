package mls.sho.mplace.accounting.repository;

import mls.sho.mplace.accounting.model.JournalEntry;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {

    @Query("""
        SELECT j.ledgerAccountCode as accountCode, 
               j.ledgerAccountName as accountName,
               SUM(COALESCE(j.debitAmount, 0)) as totalDebit,
               SUM(COALESCE(j.creditAmount, 0)) as totalCredit
        FROM JournalEntry j
        WHERE j.createdAt BETWEEN :startDate AND :endDate
        GROUP BY j.ledgerAccountCode, j.ledgerAccountName
        """)
    List<AccountBalance> getBalancesByPeriod(
        @Param("startDate") Instant startDate, 
        @Param("endDate")   Instant endDate
    );

    interface AccountBalance {
        String getAccountCode();
        String getAccountName();
        BigDecimal getTotalDebit();
        BigDecimal getTotalCredit();
    }
}

