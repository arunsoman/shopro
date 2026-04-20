package com.shopro.accounting.repository;

import com.shopro.accounting.entity.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;

@Repository
public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, UUID> {
    
    List<LedgerEntry> findByRestaurantIdOrderByTransactionDateDesc(Long restaurantId);
    
    List<LedgerEntry> findByRestaurantIdAndTransactionDateBetween(
        Long restaurantId, 
        LocalDate startDate, 
        LocalDate endDate
    );
    
    List<LedgerEntry> findByRestaurantIdAndAccountId(
        Long restaurantId, 
        UUID accountId
    );
    
    @Query("SELECT CAST(SUM(e.debitAmount) - SUM(e.creditAmount) AS double) FROM LedgerEntry e " +
           "WHERE e.accountId = :accountId AND e.restaurantId = :restaurantId")
    BigDecimal getAccountBalance(
        @Param("accountId") UUID accountId,
        @Param("restaurantId") Long restaurantId
    );
    
    List<LedgerEntry> findByReferenceIdAndReferenceType(
        UUID referenceId, 
        String referenceType
    );
}
