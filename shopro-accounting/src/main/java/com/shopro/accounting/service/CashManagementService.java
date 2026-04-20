package com.shopro.accounting.service;

import com.shopro.accounting.dto.CashDTO.*;
import com.shopro.accounting.entity.ChartOfAccounts;
import com.shopro.accounting.entity.LedgerEntry;
import com.shopro.accounting.repository.ChartOfAccountsRepository;
import com.shopro.accounting.repository.LedgerEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CashManagementService {

    private final LedgerEntryRepository ledgerEntryRepository;
    private final ChartOfAccountsRepository chartOfAccountsRepository;

    /**
     * Executes a fund transfer between two accounts (e.g. Cash -> Bank)
     * Enforces double-entry: Debit receiver, Credit sender
     */
    @Transactional
    public TransferResponse transferFunds(TransferRequest request) {
        // Validate accounts
        ChartOfAccounts fromAcc = chartOfAccountsRepository.findById(request.getFromAccountId())
            .orElseThrow(() -> new IllegalArgumentException("Source account not found"));
        
        ChartOfAccounts toAcc = chartOfAccountsRepository.findById(request.getToAccountId())
            .orElseThrow(() -> new IllegalArgumentException("Destination account not found"));

        // 1. Create the Credit entry (Money leaving the source)
        LedgerEntry creditEntry = LedgerEntry.builder()
            .restaurantId(request.getRestaurantId())
            .transactionDate(request.getTransactionDate())
            .entryType(LedgerEntry.EntryType.EXPENSE)
            .referenceNumber(request.getReference())
            .description(request.getDescription())
            .accountId(fromAcc.getAccountId())
            .accountCode(fromAcc.getAccountCode())
            .accountName(fromAcc.getAccountName())
            .debitAmount(BigDecimal.ZERO)
            .creditAmount(request.getAmount())
            .category(LedgerEntry.TransactionCategory.TRANSFER)
            .createdBy(request.getCreatedBy())
            .build();

        // 2. Create the Debit entry (Money entering the destination)
        LedgerEntry debitEntry = LedgerEntry.builder()
            .restaurantId(request.getRestaurantId())
            .transactionDate(request.getTransactionDate())
            .entryType(LedgerEntry.EntryType.EXPENSE)
            .referenceNumber(request.getReference())
            .description(request.getDescription())
            .accountId(toAcc.getAccountId())
            .accountCode(toAcc.getAccountCode())
            .accountName(toAcc.getAccountName())
            .debitAmount(request.getAmount())
            .creditAmount(BigDecimal.ZERO)
            .category(LedgerEntry.TransactionCategory.TRANSFER)
            .createdBy(request.getCreatedBy())
            .build();

        ledgerEntryRepository.saveAll(List.of(creditEntry, debitEntry));
        
        log.info("Cash transfer successful: {} from {} to {}", 
            request.getAmount(), fromAcc.getAccountName(), toAcc.getAccountName());

        return TransferResponse.builder()
            .transactionId(debitEntry.getEntryId())
            .success(true)
            .message("Funds transferred successfully")
            .build();
    }

    /**
     * Get all liquid accounts (Cash and Bank)
     */
    public List<CashBalanceResponse> getLiquidBalances(Long restaurantId) {
        return chartOfAccountsRepository.findByRestaurantId(restaurantId).stream()
            .filter(acc -> "Cash".equalsIgnoreCase(acc.getAccountSubType()) || 
                           "Bank".equalsIgnoreCase(acc.getAccountSubType()))
            .map(acc -> {
                // Calculate balance from ledger
                BigDecimal balance = ledgerEntryRepository.getAccountBalance(acc.getAccountId(), restaurantId);
                return CashBalanceResponse.builder()
                    .accountId(acc.getAccountId())
                    .accountName(acc.getAccountName())
                    .accountCode(acc.getAccountCode())
                    .balance(balance != null ? balance : BigDecimal.ZERO)
                    .accountType(acc.getAccountSubType())
                    .build();
            })
            .toList();
    }
}
