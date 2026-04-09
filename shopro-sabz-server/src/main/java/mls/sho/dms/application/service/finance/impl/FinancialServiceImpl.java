package mls.sho.dms.application.service.finance.impl;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.dto.finance.*;
import mls.sho.dms.application.service.finance.FinancialService;
import mls.sho.dms.entity.finance.*;
import mls.sho.dms.repository.finance.AccountRepository;
import mls.sho.dms.repository.finance.JournalEntryRepository;
import mls.sho.dms.repository.finance.JournalLineRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FinancialServiceImpl implements FinancialService {

    private final AccountRepository accountRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final JournalLineRepository journalLineRepository;

    @PostConstruct
    public void initCOA() {
        if (accountRepository.count() == 0) {
            log.info("Initializing Chart of Accounts...");
            createAccount("1000", "Cash on Hand", AccountType.ASSET);
            createAccount("1100", "Bank Account", AccountType.ASSET);
            createAccount("1200", "Inventory Asset", AccountType.ASSET);
            createAccount("1005", "Petty Cash", AccountType.ASSET);
            createAccount("1210", "Staff Advance Asset", AccountType.ASSET);
            createAccount("2000", "Accounts Payable", AccountType.LIABILITY);
            createAccount("2100", "Sales Tax Payable", AccountType.LIABILITY);
            createAccount("3000", "Retained Earnings", AccountType.EQUITY);
            createAccount("4000", "Sales Revenue", AccountType.REVENUE);
            createAccount("5000", "Cost of Goods Sold (COGS)", AccountType.EXPENSE);
            createAccount("6000", "Operational Expenses", AccountType.EXPENSE);
        }
    }

    private void createAccount(String code, String name, AccountType type) {
        Account acc = new Account();
        acc.setCode(code);
        acc.setName(name);
        acc.setAccountType(type);
        accountRepository.save(acc);
    }

    @Override
    @Transactional
    public JournalEntryResponse postEntry(Instant date, String description, UUID referenceId, List<LineRequest> lineRequests) {
        BigDecimal totalDebit = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;

        JournalEntry entry = new JournalEntry();
        entry.setEntryDate(date);
        entry.setDescription(description);
        entry.setReferenceId(referenceId);

        for (LineRequest req : lineRequests) {
            Account acc = accountRepository.findByCode(req.accountCode())
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + req.accountCode()));

            JournalLine line = new JournalLine();
            line.setAccount(acc);
            line.setDebitAmount(req.debit());
            line.setCreditAmount(req.credit());
            entry.addLine(line);

            // Update account balance: (Debit - Credit)
            // Balance increases with Debit for Assets/Expenses, decreases for Liabilities/Equity/Revenue
            acc.setBalance(acc.getBalance().add(req.debit().subtract(req.credit())));
            accountRepository.save(acc);

            totalDebit = totalDebit.add(req.debit());
            totalCredit = totalCredit.add(req.credit());
        }

        // Double-entry validation
        if (totalDebit.compareTo(totalCredit) != 0) {
            throw new IllegalStateException("Journal entry is not balanced. Debits: " + totalDebit + ", Credits: " + totalCredit);
        }

        JournalEntry saved = journalEntryRepository.save(entry);
        return mapEntry(saved);
    }

    @Override
    @Transactional
    public void recordSale(UUID orderId, BigDecimal amount, BigDecimal tax) {
        BigDecimal subtotal = amount.subtract(tax);
        List<LineRequest> lines = List.of(
            new LineRequest("1000", amount, BigDecimal.ZERO),     // Debit Cash
            new LineRequest("4000", BigDecimal.ZERO, subtotal),  // Credit Revenue
            new LineRequest("2100", BigDecimal.ZERO, tax)        // Credit Sales Tax Payable
        );
        postEntry(Instant.now(), "Sales from Order #" + orderId, orderId, lines);
    }

    @Override
    @Transactional
    public void recordPurchase(UUID poId, BigDecimal amount, BigDecimal tax) {
        BigDecimal subtotal = amount.subtract(tax);
        List<LineRequest> lines = List.of(
            new LineRequest("1200", subtotal, BigDecimal.ZERO),  // Debit Inventory Asset
            new LineRequest("2000", BigDecimal.ZERO, amount)     // Credit Accounts Payable
            // Simplified: tax might be handled as expense or recoverable
        );
        postEntry(Instant.now(), "Procurement from PO #" + poId, poId, lines);
    }

    @Override
    @Transactional
    public void recordCOGS(UUID orderId, BigDecimal cost) {
        List<LineRequest> lines = List.of(
            new LineRequest("5000", cost, BigDecimal.ZERO),     // Debit COGS
            new LineRequest("1200", BigDecimal.ZERO, cost)      // Credit Inventory Asset
        );
        postEntry(Instant.now(), "COGS for Order #" + orderId, orderId, lines);
    }

    @Override
    public List<AccountResponse> getAllAccounts() {
        return accountRepository.findAll().stream()
                .map(a -> new AccountResponse(a.getId(), a.getCode(), a.getName(), a.getAccountType().name(), a.getDescription(), a.getBalance()))
                .toList();
    }

    @Override
    public List<JournalEntryResponse> getLedger(Instant from, Instant to) {
        return journalEntryRepository.findByEntryDateBetweenOrderByEntryDateDesc(from, to).stream()
                .map(this::mapEntry)
                .toList();
    }

    @Override
    public PnLResponse getPnL(Instant from, Instant to) {
        List<Account> accounts = accountRepository.findAll();
        
        List<PnLResponse.CategoryBalance> revenueLines = accounts.stream()
            .filter(a -> a.getAccountType() == AccountType.REVENUE)
            .map(a -> new PnLResponse.CategoryBalance(a.getCode(), a.getName(), getPeriodSum(a, from, to).negate()))
            .filter(b -> b.balance().compareTo(BigDecimal.ZERO) != 0)
            .toList();

        List<PnLResponse.CategoryBalance> expenseLines = accounts.stream()
            .filter(a -> a.getAccountType() == AccountType.EXPENSE)
            .map(a -> new PnLResponse.CategoryBalance(a.getCode(), a.getName(), getPeriodSum(a, from, to)))
            .filter(b -> b.balance().compareTo(BigDecimal.ZERO) != 0)
            .toList();

        BigDecimal totalRevenue = revenueLines.stream().map(PnLResponse.CategoryBalance::balance).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCOGS = expenseLines.stream().filter(l -> l.accountCode().equals("5000")).map(PnLResponse.CategoryBalance::balance).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal grossProfit = totalRevenue.subtract(totalCOGS);
        BigDecimal totalOpExpenses = expenseLines.stream().filter(l -> !l.accountCode().equals("5000")).map(PnLResponse.CategoryBalance::balance).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal netIncome = grossProfit.subtract(totalOpExpenses);

        return new PnLResponse(totalRevenue, totalCOGS, grossProfit, totalOpExpenses, netIncome, revenueLines, expenseLines);
    }

    @Override
    public BalanceSheetResponse getBalanceSheet() {
        List<Account> accounts = accountRepository.findAll();

        List<BalanceSheetResponse.CategoryBalance> assetLines = accounts.stream()
            .filter(a -> a.getAccountType() == AccountType.ASSET)
            .map(a -> new BalanceSheetResponse.CategoryBalance(a.getCode(), a.getName(), a.getBalance()))
            .toList();

        List<BalanceSheetResponse.CategoryBalance> liabilityLines = accounts.stream()
            .filter(a -> a.getAccountType() == AccountType.LIABILITY)
            .map(a -> new BalanceSheetResponse.CategoryBalance(a.getCode(), a.getName(), a.getBalance().negate()))
            .toList();

        List<BalanceSheetResponse.CategoryBalance> equityLines = accounts.stream()
            .filter(a -> a.getAccountType() == AccountType.EQUITY)
            .map(a -> new BalanceSheetResponse.CategoryBalance(a.getCode(), a.getName(), a.getBalance().negate()))
            .toList();

        BigDecimal totalAssets = assetLines.stream().map(BalanceSheetResponse.CategoryBalance::balance).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalLiabilities = liabilityLines.stream().map(BalanceSheetResponse.CategoryBalance::balance).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalEquity = equityLines.stream().map(BalanceSheetResponse.CategoryBalance::balance).reduce(BigDecimal.ZERO, BigDecimal::add);

        return new BalanceSheetResponse(totalAssets, totalLiabilities, totalEquity, assetLines, liabilityLines, equityLines);
    }

    private BigDecimal getPeriodSum(Account account, Instant from, Instant to) {
        BigDecimal sum = journalLineRepository.sumAmountByAccountAndDate(account, from, to);
        return sum != null ? sum : BigDecimal.ZERO;
    }

    private JournalEntryResponse mapEntry(JournalEntry entry) {
        List<JournalLineResponse> lineResponses = entry.getLines().stream()
                .map(l -> new JournalLineResponse(l.getId(), l.getAccount().getId(), l.getAccount().getName(), l.getAccount().getCode(), l.getDebitAmount(), l.getCreditAmount()))
                .toList();
        return new JournalEntryResponse(entry.getId(), entry.getEntryDate(), entry.getDescription(), entry.getReferenceId(), lineResponses);
    }
}
