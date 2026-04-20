package com.shopro.accounting.service;

import com.shopro.accounting.dto.ExpenseDTO.*;
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
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExpenseService {

    private final ChartOfAccountsRepository chartOfAccountsRepository;
    private final LedgerEntryRepository ledgerEntryRepository;

    // In-memory draft storage (replace with database in production)
    private final Map<UUID, ExpenseBatchDraft> drafts = new HashMap<>();

    /**
     * Get expense categories for dropdown
     * Groups: Rent, Utilities, Labor, Supplies, Professional, Marketing, Other
     */
    public List<ExpenseCategoryDTO> getExpenseCategories(Long restaurantId) {
        List<ChartOfAccounts> expenseAccounts = chartOfAccountsRepository
            .findByRestaurantIdAndAccountType(restaurantId, ChartOfAccounts.AccountType.EXPENSE);
        
        return expenseAccounts.stream()
            .filter(ChartOfAccounts::getIsActive)
            .filter(ChartOfAccounts::getAllowManualEntry)
            .map(acc -> ExpenseCategoryDTO.builder()
                .code(acc.getAccountCode())
                .name(acc.getAccountName())
                .group(acc.getAccountSubType())
                .build()
            )
            .sorted(Comparator.comparing(ExpenseCategoryDTO::getCode))
            .toList();
    }

    /**
     * Get payment methods (Cash + Bank accounts)
     */
    public List<PaymentMethodDTO> getPaymentMethods(Long restaurantId) {
        List<ChartOfAccounts> cashAndBank = chartOfAccountsRepository
            .findByRestaurantIdAndAccountType(restaurantId, ChartOfAccounts.AccountType.ASSET);
        
        return cashAndBank.stream()
            .filter(acc -> acc.getAccountSubType() != null && 
                          (acc.getAccountSubType().equals("Cash") || 
                           acc.getAccountSubType().equals("Bank")))
            .filter(ChartOfAccounts::getIsActive)
            .map(acc -> PaymentMethodDTO.builder()
                .code(acc.getAccountCode())
                .name(acc.getAccountName())
                .type(acc.getAccountSubType())
                .build()
            )
            .toList();
    }

    /**
     * Create expense draft (multiple rows, not yet posted to ledger)
     */
    @Transactional
    public ExpenseBatchResponse createDraft(ExpenseBatchRequest request) {
        UUID batchId = UUID.randomUUID();
        
        ExpenseBatchDraft draft = ExpenseBatchDraft.builder()
            .batchId(batchId)
            .restaurantId(request.getRestaurantId())
            .date(request.getDate())
            .paymentMethodAccountId(request.getPaymentMethodAccountId())
            .paymentReference(request.getPaymentReference())
            .lines(request.getLines())
            .createdBy(request.getCreatedBy())
            .createdAt(LocalDateTime.now())
            .build();
        
        drafts.put(batchId, draft);
        
        BigDecimal total = request.getLines().stream()
            .map(ExpenseLineRequest::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        log.info("Expense draft created: {} with {} lines, total: ${}", batchId, request.getLines().size(), total);
        
        return ExpenseBatchResponse.builder()
            .batchId(batchId)
            .restaurantId(request.getRestaurantId())
            .date(request.getDate())
            .totalAmount(total)
            .status("DRAFT")
            .createdBy(request.getCreatedBy())
            .createdAt(draft.getCreatedAt().toString())
            .lines(request.getLines().stream()
                .map(line -> ExpenseLineResponse.builder()
                    .expenseCategory(getAccountName(line.getExpenseAccountId()))
                    .description(line.getDescription())
                    .amount(line.getAmount())
                    .build()
                )
                .toList()
            )
            .build();
    }

    /**
     * Get all drafts for a restaurant
     */
    public List<ExpenseBatchResponse> getDrafts(Long restaurantId) {
        return drafts.values().stream()
            .filter(d -> d.getRestaurantId().equals(restaurantId))
            .map(this::toResponse)
            .toList();
    }

    /**
     * Post draft to ledger (creates double-entry journal entries)
     * User NEVER sees debit/credit - this is automatic
     */
    @Transactional
    public ExpenseBatchResponse postDraft(UUID batchId, String postedBy) {
        ExpenseBatchDraft draft = drafts.get(batchId);
        if (draft == null) {
            throw new IllegalArgumentException("Draft not found: " + batchId);
        }

        // Get payment method account (Credit side)
        ChartOfAccounts paymentAccount = chartOfAccountsRepository
            .findById(draft.getPaymentMethodAccountId())
            .orElseThrow(() -> new IllegalStateException("Payment account not found"));

        // Calculate total credit amount
        BigDecimal totalCredit = draft.getLines().stream()
            .map(ExpenseLineRequest::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Create ledger entries
        List<LedgerEntry> entries = new ArrayList<>();

        // Debit entries: One per expense line
        for (ExpenseLineRequest line : draft.getLines()) {
            ChartOfAccounts expenseAccount = chartOfAccountsRepository
                .findById(line.getExpenseAccountId())
                .orElseThrow(() -> new IllegalStateException("Expense account not found"));

            entries.add(LedgerEntry.builder()
                .restaurantId(draft.getRestaurantId())
                .transactionDate(draft.getDate())
                .entryType(LedgerEntry.EntryType.EXPENSE)
                .referenceNumber("EXP-" + batchId.toString().substring(0, 8))
                .description(line.getDescription() != null ? line.getDescription() : expenseAccount.getAccountName())
                .accountId(line.getExpenseAccountId())
                .accountCode(expenseAccount.getAccountCode())
                .accountName(expenseAccount.getAccountName())
                .debitAmount(line.getAmount())
                .creditAmount(BigDecimal.ZERO)
                .category(LedgerEntry.TransactionCategory.EXPENSE)
                .createdBy(postedBy)
                .build());
        }

        // Credit entry: Total to payment method (Cash/Bank)
        entries.add(LedgerEntry.builder()
            .restaurantId(draft.getRestaurantId())
            .transactionDate(draft.getDate())
            .entryType(LedgerEntry.EntryType.EXPENSE)
            .referenceNumber("EXP-" + batchId.toString().substring(0, 8))
            .description("Total expense payment")
            .accountId(draft.getPaymentMethodAccountId())
            .accountCode(paymentAccount.getAccountCode())
            .accountName(paymentAccount.getAccountName())
            .debitAmount(BigDecimal.ZERO)
            .creditAmount(totalCredit)
            .category(LedgerEntry.TransactionCategory.EXPENSE)
            .createdBy(postedBy)
            .build());

        // Save to ledger
        ledgerEntryRepository.saveAll(entries);

        // Remove from drafts
        drafts.remove(batchId);

        log.info("Draft {} posted to ledger: {} entries, total: ${}", 
            batchId, entries.size(), totalCredit);

        return toResponse(draft).toBuilder()
            .status("POSTED")
            .build();
    }

    /**
     * Delete draft
     */
    public void deleteDraft(UUID batchId) {
        if (!drafts.containsKey(batchId)) {
            throw new IllegalArgumentException("Draft not found: " + batchId);
        }
        drafts.remove(batchId);
        log.info("Draft deleted: {}", batchId);
    }

    /**
     * Post single expense directly (no draft)
     */
    @Transactional
    public ExpenseResponse postExpense(ExpenseRequest request) {
        BigDecimal total = request.getLines().stream()
            .map(ExpenseLineRequest::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        ChartOfAccounts paymentAccount = chartOfAccountsRepository
            .findById(request.getPaymentMethodAccountId())
            .orElseThrow(() -> new IllegalStateException("Payment account not found"));

        List<LedgerEntry> entries = new ArrayList<>();

        // Debit entries
        for (ExpenseLineRequest line : request.getLines()) {
            ChartOfAccounts expenseAccount = chartOfAccountsRepository
                .findById(line.getExpenseAccountId())
                .orElseThrow(() -> new IllegalStateException("Expense account not found"));

            entries.add(LedgerEntry.builder()
                .restaurantId(request.getRestaurantId())
                .transactionDate(request.getDate())
                .entryType(LedgerEntry.EntryType.EXPENSE)
                .referenceNumber(request.getPaymentReference())
                .description(line.getDescription() != null ? line.getDescription() : expenseAccount.getAccountName())
                .accountId(line.getExpenseAccountId())
                .accountCode(expenseAccount.getAccountCode())
                .accountName(expenseAccount.getAccountName())
                .debitAmount(line.getAmount())
                .creditAmount(BigDecimal.ZERO)
                .category(LedgerEntry.TransactionCategory.EXPENSE)
                .build());
        }

        // Credit entry
        entries.add(LedgerEntry.builder()
            .restaurantId(request.getRestaurantId())
            .transactionDate(request.getDate())
            .entryType(LedgerEntry.EntryType.EXPENSE)
            .referenceNumber(request.getPaymentReference())
            .description("Expense payment")
            .accountId(request.getPaymentMethodAccountId())
            .accountCode(paymentAccount.getAccountCode())
            .accountName(paymentAccount.getAccountName())
            .debitAmount(BigDecimal.ZERO)
            .creditAmount(total)
            .category(LedgerEntry.TransactionCategory.EXPENSE)
            .build());

        ledgerEntryRepository.saveAll(entries);

        return ExpenseResponse.builder()
            .transactionId(entries.get(0).getEntryId())
            .date(request.getDate())
            .totalAmount(total)
            .status("POSTED")
            .lines(request.getLines().stream()
                .map(line -> ExpenseLineResponse.builder()
                    .expenseCategory(getAccountName(line.getExpenseAccountId()))
                    .description(line.getDescription())
                    .amount(line.getAmount())
                    .build()
                )
                .toList()
            )
            .build();
    }

    private String getAccountName(UUID accountId) {
        return chartOfAccountsRepository.findById(accountId)
            .map(ChartOfAccounts::getAccountName)
            .orElse("Unknown");
    }

    private ExpenseBatchResponse toResponse(ExpenseBatchDraft draft) {
        BigDecimal total = draft.getLines().stream()
            .map(ExpenseLineRequest::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ExpenseBatchResponse.builder()
            .batchId(draft.getBatchId())
            .restaurantId(draft.getRestaurantId())
            .date(draft.getDate())
            .totalAmount(total)
            .status("DRAFT")
            .createdBy(draft.getCreatedBy())
            .createdAt(draft.getCreatedAt().toString())
            .lines(draft.getLines().stream()
                .map(line -> ExpenseLineResponse.builder()
                    .expenseCategory(getAccountName(line.getExpenseAccountId()))
                    .description(line.getDescription())
                    .amount(line.getAmount())
                    .build()
                )
                .toList()
            )
            .build();
    }

    @lombok.Data
    @lombok.Builder
    private static class ExpenseBatchDraft {
        private UUID batchId;
        private Long restaurantId;
        private LocalDate date;
        private UUID paymentMethodAccountId;
        private String paymentReference;
        private List<ExpenseLineRequest> lines;
        private String createdBy;
        private LocalDateTime createdAt;
    }
}
