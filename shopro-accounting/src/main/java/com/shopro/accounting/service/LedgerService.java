package com.shopro.accounting.service;

import com.shopro.accounting.entity.ChartOfAccounts;
import com.shopro.accounting.entity.LedgerEntry;
import com.shopro.accounting.repository.ChartOfAccountsRepository;
import com.shopro.accounting.repository.LedgerEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LedgerService {

    private final LedgerEntryRepository ledgerEntryRepository;
    private final ChartOfAccountsRepository chartOfAccountsRepository;

    /**
     * Creates a double-entry journal transaction.
     * Debits and credits MUST be equal.
     */
    @Transactional
    public void createJournalEntry(JournalEntryRequest request) {
        validateDoubleEntry(request);
        
        List<LedgerEntry> entries = request.getLines().stream()
            .map(line -> {
                ChartOfAccounts account = chartOfAccountsRepository
                    .findById(line.getAccountId())
                    .orElseThrow(() -> new IllegalArgumentException(
                        "Account not found: " + line.getAccountId()
                    ));
                
                return LedgerEntry.builder()
                    .restaurantId(request.getRestaurantId())
                    .transactionDate(request.getTransactionDate())
                    .entryType(LedgerEntry.EntryType.JOURNAL)
                    .referenceNumber(request.getReferenceNumber())
                    .description(request.getDescription())
                    .accountId(line.getAccountId())
                    .accountCode(account.getAccountCode())
                    .accountName(account.getAccountName())
                    .debitAmount(line.getDebitAmount() != null ? line.getDebitAmount() : BigDecimal.ZERO)
                    .creditAmount(line.getCreditAmount() != null ? line.getCreditAmount() : BigDecimal.ZERO)
                    .category(LedgerEntry.TransactionCategory.ADJUSTMENT)
                    .createdBy(request.getCreatedBy())
                    .build();
            })
            .toList();
        
        ledgerEntryRepository.saveAll(entries);
        log.info("Journal entry created: {}", request.getReferenceNumber());
    }

    /**
     * Records daily sales from POS orders.
     * Creates 4 entries: Debit Cash, Credit Sales Revenue, Credit Tax Payable, Credit Tips Payable
     */
    @Transactional
    public void recordDailySales(Long restaurantId, LocalDate date, 
                                  BigDecimal totalAmount, BigDecimal taxAmount, 
                                  BigDecimal tipAmount, String createdBy) {
        
        BigDecimal salesRevenue = totalAmount.subtract(taxAmount).subtract(tipAmount);
        
        // Get accounts
        ChartOfAccounts cashAccount = chartOfAccountsRepository
            .findByRestaurantIdAndAccountCode(restaurantId, "1000")
            .orElseThrow(() -> new IllegalStateException("Cash account not configured"));
        
        ChartOfAccounts salesAccount = chartOfAccountsRepository
            .findByRestaurantIdAndAccountCode(restaurantId, "4100")
            .orElseThrow(() -> new IllegalStateException("Sales account not configured"));
        
        ChartOfAccounts taxAccount = chartOfAccountsRepository
            .findByRestaurantIdAndAccountCode(restaurantId, "2200")
            .orElseThrow(() -> new IllegalStateException("Tax payable account not configured"));
        
        ChartOfAccounts tipsAccount = chartOfAccountsRepository
            .findByRestaurantIdAndAccountCode(restaurantId, "2300")
            .orElseThrow(() -> new IllegalStateException("Tips payable account not configured"));
        
        // Create entries
        var entries = List.of(
            // Debit: Cash (total collected)
            LedgerEntry.builder()
                .restaurantId(restaurantId)
                .transactionDate(date)
                .entryType(LedgerEntry.EntryType.SALES)
                .referenceNumber("SALES-" + date)
                .description("Daily sales recording for " + date)
                .accountId(cashAccount.getAccountId())
                .accountCode(cashAccount.getAccountCode())
                .accountName(cashAccount.getAccountName())
                .debitAmount(totalAmount.add(tipAmount))
                .creditAmount(BigDecimal.ZERO)
                .category(LedgerEntry.TransactionCategory.SALES)
                .createdBy(createdBy)
                .build(),
            
            // Credit: Sales Revenue
            LedgerEntry.builder()
                .restaurantId(restaurantId)
                .transactionDate(date)
                .entryType(LedgerEntry.EntryType.SALES)
                .referenceNumber("SALES-" + date)
                .description("Daily sales revenue")
                .accountId(salesAccount.getAccountId())
                .accountCode(salesAccount.getAccountCode())
                .accountName(salesAccount.getAccountName())
                .debitAmount(BigDecimal.ZERO)
                .creditAmount(salesRevenue)
                .category(LedgerEntry.TransactionCategory.SALES)
                .createdBy(createdBy)
                .build(),
            
            // Credit: Tax Payable
            LedgerEntry.builder()
                .restaurantId(restaurantId)
                .transactionDate(date)
                .entryType(LedgerEntry.EntryType.SALES)
                .referenceNumber("SALES-" + date)
                .description("Sales tax collected")
                .accountId(taxAccount.getAccountId())
                .accountCode(taxAccount.getAccountCode())
                .accountName(taxAccount.getAccountName())
                .debitAmount(BigDecimal.ZERO)
                .creditAmount(taxAmount)
                .category(LedgerEntry.TransactionCategory.TAX)
                .createdBy(createdBy)
                .build(),
            
            // Credit: Tips Payable
            LedgerEntry.builder()
                .restaurantId(restaurantId)
                .transactionDate(date)
                .entryType(LedgerEntry.EntryType.SALES)
                .referenceNumber("SALES-" + date)
                .description("Tips collected")
                .accountId(tipsAccount.getAccountId())
                .accountCode(tipsAccount.getAccountCode())
                .accountName(tipsAccount.getAccountName())
                .debitAmount(BigDecimal.ZERO)
                .creditAmount(tipAmount)
                .category(LedgerEntry.TransactionCategory.SALES)
                .createdBy(createdBy)
                .build()
        );
        
        ledgerEntryRepository.saveAll(entries);
        log.info("Daily sales recorded for {}: ${}", date, totalAmount);
    }

    /**
     * Validates that debits equal credits
     */
    private void validateDoubleEntry(JournalEntryRequest request) {
        BigDecimal totalDebits = request.getLines().stream()
            .map(line -> line.getDebitAmount() != null ? line.getDebitAmount() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalCredits = request.getLines().stream()
            .map(line -> line.getCreditAmount() != null ? line.getCreditAmount() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        if (totalDebits.compareTo(totalCredits) != 0) {
            throw new IllegalArgumentException(
                String.format("Debits (%s) must equal credits (%s)", totalDebits, totalCredits)
            );
        }
    }

    public BigDecimal getAccountBalance(UUID accountId, Long restaurantId) {
        BigDecimal balance = ledgerEntryRepository.getAccountBalance(accountId, restaurantId);
        return balance != null ? balance : BigDecimal.ZERO;
    }

    public List<LedgerEntry> getLedgerEntries(Long restaurantId, LocalDate startDate, LocalDate endDate) {
        return ledgerEntryRepository.findByRestaurantIdAndTransactionDateBetween(
            restaurantId, startDate, endDate
        );
    }
}
