package mls.sho.dms.application.accounting.repository;

import mls.sho.dms.application.accounting.entity.AccountingLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface AccountingLedgerRepository extends JpaRepository<AccountingLedger, UUID> {

    List<AccountingLedger> findByRestaurantIdOrderByTransactionDateDesc(Long restaurantId);

    List<AccountingLedger> findByRestaurantIdAndTransactionDateBetweenOrderByTransactionDateDesc(
            Long restaurantId, LocalDate startDate, LocalDate endDate);

    List<AccountingLedger> findByRestaurantIdAndAccountIdOrderByTransactionDateDesc(
            Long restaurantId, UUID accountId);

    List<AccountingLedger> findByRestaurantIdAndStaffIdOrderByTransactionDateDesc(
            Long restaurantId, UUID staffId);

    List<AccountingLedger> findByRestaurantIdAndReferenceIdAndReferenceType(
            Long restaurantId, UUID referenceId, String referenceType);

    @Query("SELECT SUM(l.debitAmount) - SUM(l.creditAmount) FROM AccountingLedger l WHERE l.restaurantId = :restaurantId AND l.accountId = :accountId")
    BigDecimal getAccountBalance(Long restaurantId, UUID accountId);

    @Query("SELECT l.accountId, l.accountCode, l.accountName, SUM(l.debitAmount) as totalDebit, SUM(l.creditAmount) as totalCredit " +
           "FROM AccountingLedger l WHERE l.restaurantId = :restaurantId AND l.transactionDate BETWEEN :startDate AND :endDate " +
           "GROUP BY l.accountId, l.accountCode, l.accountName ORDER BY l.accountCode")
    List<Object[]> getTrialBalance(Long restaurantId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT l.category, SUM(l.debitAmount), SUM(l.creditAmount) FROM AccountingLedger l " +
           "WHERE l.restaurantId = :restaurantId AND l.transactionDate BETWEEN :startDate AND :endDate " +
           "GROUP BY l.category")
    List<Object[]> getCategorySummary(Long restaurantId, LocalDate startDate, LocalDate endDate);
}
