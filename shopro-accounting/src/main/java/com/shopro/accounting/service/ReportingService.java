package com.shopro.accounting.service;

import com.shopro.accounting.dto.ReportDTO.*;
import com.shopro.accounting.entity.ChartOfAccounts;
import com.shopro.accounting.entity.LedgerEntry;
import com.shopro.accounting.repository.ChartOfAccountsRepository;
import com.shopro.accounting.repository.LedgerEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportingService {

    private final LedgerEntryRepository ledgerEntryRepository;
    private final ChartOfAccountsRepository chartOfAccountsRepository;

    /**
     * Generates a professional Profit & Loss statement
     */
    public ProfitAndLoss generateProfitAndLoss(Long restaurantId, LocalDate start, LocalDate end) {
        List<LedgerEntry> entries = ledgerEntryRepository.findByRestaurantIdAndTransactionDateBetween(restaurantId, start, end);
        
        // Group by account
        Map<UUID, List<LedgerEntry>> grouped = entries.stream()
            .collect(Collectors.groupingBy(LedgerEntry::getAccountId));

        List<PLLineItem> lineItems = new ArrayList<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalCogs = BigDecimal.ZERO;
        BigDecimal totalExpenses = BigDecimal.ZERO;

        // 1. Process Revenues (Credit balances)
        List<ChartOfAccounts> revenueAccs = chartOfAccountsRepository.findByRestaurantIdAndAccountType(restaurantId, ChartOfAccounts.AccountType.REVENUE);
        for (ChartOfAccounts acc : revenueAccs) {
            BigDecimal balance = calculateSuma(grouped.get(acc.getAccountId()), "CREDIT");
            if (balance.compareTo(BigDecimal.ZERO) != 0) {
                totalRevenue = totalRevenue.add(balance);
                lineItems.add(PLLineItem.builder()
                    .accountName(acc.getAccountName())
                    .accountCode(acc.getAccountCode())
                    .amount(balance)
                    .category("REVENUE")
                    .build());
            }
        }

        // 2. Process COGS (Debit balances)
        List<ChartOfAccounts> cogsAccs = chartOfAccountsRepository.findByRestaurantIdAndAccountType(restaurantId, ChartOfAccounts.AccountType.EXPENSE)
            .stream().filter(a -> a.getAccountCode().startsWith("5")).toList(); // 5000 range is COGS
        
        for (ChartOfAccounts acc : cogsAccs) {
            BigDecimal balance = calculateSuma(grouped.get(acc.getAccountId()), "DEBIT");
            if (balance.compareTo(BigDecimal.ZERO) != 0) {
                totalCogs = totalCogs.add(balance);
                lineItems.add(PLLineItem.builder()
                    .accountName(acc.getAccountName())
                    .accountCode(acc.getAccountCode())
                    .amount(balance)
                    .category("COGS")
                    .build());
            }
        }

        // 3. Process OpEx (Debit balances - non COGS)
        List<ChartOfAccounts> opexAccs = chartOfAccountsRepository.findByRestaurantIdAndAccountType(restaurantId, ChartOfAccounts.AccountType.EXPENSE)
            .stream().filter(a -> !a.getAccountCode().startsWith("5")).toList();

        for (ChartOfAccounts acc : opexAccs) {
            BigDecimal balance = calculateSuma(grouped.get(acc.getAccountId()), "DEBIT");
            if (balance.compareTo(BigDecimal.ZERO) != 0) {
                totalExpenses = totalExpenses.add(balance);
                lineItems.add(PLLineItem.builder()
                    .accountName(acc.getAccountName())
                    .accountCode(acc.getAccountCode())
                    .amount(balance)
                    .category("EXPENSE")
                    .build());
            }
        }

        BigDecimal grossProfit = totalRevenue.subtract(totalCogs);
        BigDecimal netIncome = grossProfit.subtract(totalExpenses);

        return ProfitAndLoss.builder()
            .startDate(start)
            .endDate(end)
            .totalRevenue(totalRevenue)
            .totalCogs(totalCogs)
            .grossProfit(grossProfit)
            .totalOperatingExpenses(totalExpenses)
            .netOperatingIncome(netIncome)
            .lineItems(lineItems)
            .build();
    }

    /**
     * Generates the la la l la "Holy Grail" of restaurant metrics: The Prime Cost Report
     */
    public PrimeCostReport generatePrimeCost(Long restaurantId, LocalDate start, LocalDate end) {
        ProfitAndLoss pl = generateProfitAndLoss(restaurantId, start, end);
        
        // Labour cost is usually 6000 range
        BigDecimal laborCost = ledgerEntryRepository.findByRestaurantIdAndTransactionDateBetween(restaurantId, start, end)
            .stream()
            .filter(e -> e.getAccountCode().startsWith("60"))
            .map(LedgerEntry::getDebitAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPrimeCost = pl.getTotalCogs().add(laborCost);
        BigDecimal primePct = BigDecimal.ZERO;
        
        if (pl.getTotalRevenue().compareTo(BigDecimal.ZERO) > 0) {
            primePct = totalPrimeCost.divide(pl.getTotalRevenue(), 4, RoundingMode.HALF_UP)
                                    .multiply(BigDecimal.valueOf(100));
        }

        String status = "EXCELLENT";
        if (primePct.compareTo(new BigDecimal("65")) > 0) status = "CRITICAL";
        else if (primePct.compareTo(new BigDecimal("60")) > 0) status = "WARNING";
        else if (primePct.compareTo(new BigDecimal("55")) > 0) status = "GOOD";

        return PrimeCostReport.builder()
            .startDate(start)
            .endDate(end)
            .totalSales(pl.getTotalRevenue())
            .foodCost(pl.getTotalCogs())
            .laborCost(laborCost)
            .totalPrimeCost(totalPrimeCost)
            .primeCostPercentage(primePct)
            .status(status)
            .build();
    }

    /**
     * Generates Balance Sheet (Snapshot of Assets, Liabilities, Equity)
     */
    public BalanceSheet generateBalanceSheet(Long restaurantId, LocalDate asOfDate) {
        List<LedgerEntry> entries = ledgerEntryRepository.findByRestaurantIdAndTransactionDateBetween(restaurantId, LocalDate.of(2000, 1, 1), asOfDate);
        
        Map<UUID, List<LedgerEntry>> grouped = entries.stream()
            .collect(Collectors.groupingBy(LedgerEntry::getAccountId));

        List<BalanceItem> assets = new ArrayList<>();
        List<BalanceItem> liabilities = new ArrayList<>();
        List<BalanceItem> equity = new ArrayList<>();

        BigDecimal totalAssets = BigDecimal.ZERO;
        BigDecimal totalLiabs = BigDecimal.ZERO;
        BigDecimal totalEq = BigDecimal.ZERO;

        List<ChartOfAccounts> allAccs = chartOfAccountsRepository.findByRestaurantId(restaurantId);

        for (ChartOfAccounts acc : allAccs) {
            BigDecimal balance = calculateFinalBalance(grouped.get(acc.getAccountId()), acc.getAccountType());
            
            BalanceItem item = BalanceItem.builder()
                .accountName(acc.getAccountName())
                .balance(balance)
                .group(acc.getAccountSubType())
                .build();

            switch (acc.getAccountType()) {
                case ASSET -> {
                    assets.add(item);
                    totalAssets = totalAssets.add(balance);
                }
                case LIABILITY -> {
                    liabilities.add(item);
                    totalLiabs = totalLiabs.add(balance);
                }
                case EQUITY -> {
                    equity.add(item);
                    totalEq = totalEq.add(balance);
                }
            }
        }

        return BalanceSheet.builder()
            .asOfDate(asOfDate)
            .totalAssets(totalAssets)
            .totalLiabilities(totalLiabs)
            .totalEquity(totalEq)
            .assets(assets)
            .liabilities(liabilities)
            .equity(equity)
            .build();
    }

    private BigDecimal calculateSuma(List<LedgerEntry> entries, String type) {
        if (entries == null) return BigDecimal.ZERO;
        return entries.stream()
            .map(e -> type.equals("DEBIT") ? e.getDebitAmount() : e.getCreditAmount())
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateFinalBalance(List<LedgerEntry> entries, ChartOfAccounts.AccountType type) {
        if (entries == null) return BigDecimal.ZERO;
        
        BigDecimal debits = entries.stream().map(LedgerEntry::getDebitAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal credits = entries.stream().map(LedgerEntry::getCreditAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        return switch (type) {
            case ASSET, EXPENSE -> debits.subtract(credits);
            case LIABILITY, EQUITY, REVENUE -> credits.subtract(debits);
        };
    }
}
