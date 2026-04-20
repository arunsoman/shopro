package mls.sho.dms.application.accounting.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.accounting.dto.AccountingDtos.*;
import mls.sho.dms.application.accounting.entity.*;
import mls.sho.dms.application.accounting.repository.*;
import mls.sho.dms.application.pos.repository.OrderRepository;
import mls.sho.dms.application.pos.entity.Order;
import mls.sho.dms.application.pos.entity.OrderLine;
import mls.sho.dms.application.costing.entity.MenuCostGroup;
import mls.sho.dms.entity.users.Staff;
import mls.sho.dms.entity.users.StaffShift;
import mls.sho.dms.application.users.repo.StaffRepository;
import mls.sho.dms.application.users.repo.StaffShiftRepository;
import mls.sho.dms.entity.Restaurant;
import mls.sho.dms.application.pos.repository.RestaurantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AccountingService {

    private final ChartOfAccountRepository chartOfAccountRepository;
    private final AccountingLedgerRepository ledgerRepository;
    private final SalaryDisbursementRepository disbursementRepository;
    private final TaxConfigRepository taxConfigRepository;
    private final AccountingInvoiceRepository invoiceRepository;
    private final StaffRepository staffRepository;
    private final StaffShiftRepository staffShiftRepository;
    private final RestaurantRepository restaurantRepository;
    private final OrderRepository orderRepository;

    // ============ Chart of Accounts ============

    @Transactional
    public ChartOfAccount createAccount(CreateAccountRequest req) {
        if (chartOfAccountRepository.existsByAccountCode(req.getAccountCode())) {
            throw new RuntimeException("Account code already exists: " + req.getAccountCode());
        }

        ChartOfAccount account = ChartOfAccount.builder()
                .restaurantId(req.getRestaurantId())
                .accountCode(req.getAccountCode())
                .accountName(req.getAccountName())
                .accountType(req.getAccountType())
                .accountSubType(req.getAccountSubType())
                .parentAccountId(req.getParentAccountId())
                .description(req.getDescription())
                .defaultTaxRate(req.getDefaultTaxRate())
                .isTaxable(req.getIsTaxable() != null ? req.getIsTaxable() : false)
                .allowManualEntry(req.getAllowManualEntry() != null ? req.getAllowManualEntry() : true)
                .balance(BigDecimal.ZERO)
                .isActive(true)
                .build();

        return chartOfAccountRepository.save(account);
    }

    public List<ChartOfAccount> getAccounts(Long restaurantId) {
        return chartOfAccountRepository.findByRestaurantIdAndIsActiveTrue(restaurantId);
    }

    public Map<String, List<ChartOfAccount>> getAccountsGrouped(Long restaurantId) {
        List<ChartOfAccount> accounts = getAccounts(restaurantId);
        Map<String, List<ChartOfAccount>> grouped = new LinkedHashMap<>();
        
        for (ChartOfAccount.AccountType type : ChartOfAccount.AccountType.values()) {
            List<ChartOfAccount> typeAccounts = accounts.stream()
                    .filter(a -> a.getAccountType() == type)
                    .toList();
            if (!typeAccounts.isEmpty()) {
                grouped.put(type.name(), typeAccounts);
            }
        }
        return grouped;
    }

    // ============ Double-Entry Ledger ============

    @Transactional
    public List<AccountingLedger> createJournalEntry(JournalEntryRequest req) {
        List<AccountingLedger> entries = new ArrayList<>();
        
        // Validate debits = credits
        BigDecimal totalDebits = req.getLines().stream()
                .map(l -> l.getDebit() != null ? l.getDebit() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalCredits = req.getLines().stream()
                .map(l -> l.getCredit() != null ? l.getCredit() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        if (totalDebits.compareTo(totalCredits) != 0) {
            throw new RuntimeException("Debits must equal credits. Debits: " + totalDebits + ", Credits: " + totalCredits);
        }

        String refNumber = req.getReferenceNumber() != null ? req.getReferenceNumber() : 
                "JE-" + System.currentTimeMillis();

        for (JournalEntryRequest.JournalEntryLine line : req.getLines()) {
            ChartOfAccount account = chartOfAccountRepository.findById(line.getAccountId())
                    .orElseThrow(() -> new RuntimeException("Account not found: " + line.getAccountId()));

            AccountingLedger entry = AccountingLedger.builder()
                    .restaurantId(1L) // TODO: Get from context
                    .transactionDate(req.getTransactionDate())
                    .entryType(AccountingLedger.EntryType.JOURNAL_ENTRY)
                    .referenceNumber(refNumber)
                    .description(req.getDescription())
                    .accountId(account.getAccountId())
                    .accountCode(account.getAccountCode())
                    .accountName(account.getAccountName())
                    .debitAmount(line.getDebit() != null ? line.getDebit() : BigDecimal.ZERO)
                    .creditAmount(line.getCredit() != null ? line.getCredit() : BigDecimal.ZERO)
                    .taxAmount(line.getTaxAmount() != null ? line.getTaxAmount() : BigDecimal.ZERO)
                    .taxRate(line.getTaxRate())
                    .staffId(line.getStaffId())
                    .staffName(line.getStaffName())
                    .category(req.getCategory())
                    .notes(line.getNotes())
                    .createdBy("system")
                    .build();

            entry = ledgerRepository.save(entry);
            entries.add(entry);
        }

        return entries;
    }

    public List<AccountingLedger> getLedgerEntries(Long restaurantId, LocalDate startDate, LocalDate endDate) {
        return ledgerRepository.findByRestaurantIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                restaurantId, startDate, endDate);
    }

    // ============ Salary Disbursement with Tax Calculation ============

    @Transactional
    public SalaryDisbursement createSalaryDisbursement(CreateDisbursementRequest req) {
        // Calculate taxes based on configuration
        TaxSummaryDto taxSummary = calculateTaxes(req.getGrossPay(), 1L, "US");
        
        SalaryDisbursement disbursement = SalaryDisbursement.builder()
                .restaurantId(1L)
                .staffId(req.getStaffId())
                .staffName(req.getStaffName())
                .payPeriodStart(req.getPayPeriodStart())
                .payPeriodEnd(req.getPayPeriodEnd())
                .payDate(req.getPayDate())
                .hourlyRate(req.getHourlyRate())
                .totalHours(req.getTotalHours())
                .grossPay(req.getGrossPay())
                .federalTax(req.getFederalTax() != null ? req.getFederalTax() : taxSummary.getFederalTax())
                .stateTax(req.getStateTax() != null ? req.getStateTax() : taxSummary.getStateTax())
                .localTax(req.getLocalTax() != null ? req.getLocalTax() : taxSummary.getLocalTax())
                .socialSecurityTax(req.getSocialSecurityTax() != null ? req.getSocialSecurityTax() : taxSummary.getSocialSecurityTax())
                .medicareTax(req.getMedicareTax() != null ? req.getMedicareTax() : taxSummary.getMedicareTax())
                .otherDeductions(req.getOtherDeductions() != null ? req.getOtherDeductions() : BigDecimal.ZERO)
                .totalTax(BigDecimal.ZERO) // Will be calculated below
                .netPay(BigDecimal.ZERO) // Will be calculated below
                .paymentMethod(req.getPaymentMethod())
                .paymentReference(req.getPaymentReference())
                .status(SalaryDisbursement.DisbursementStatus.PENDING)
                .notes(req.getNotes())
                .build();

        // Calculate total tax and net pay
        disbursement.setTotalTax(
                disbursement.getFederalTax()
                .add(disbursement.getStateTax())
                .add(disbursement.getLocalTax())
                .add(disbursement.getSocialSecurityTax())
                .add(disbursement.getMedicareTax())
                .add(disbursement.getOtherDeductions())
        );
        disbursement.setNetPay(disbursement.getGrossPay().subtract(disbursement.getTotalTax()));

        return disbursementRepository.save(disbursement);
    }

    @Transactional
    public SalaryDisbursement disburseSalary(UUID disbursementId) {
        SalaryDisbursement disbursement = disbursementRepository.findById(disbursementId)
                .orElseThrow(() -> new RuntimeException("Disbursement not found"));

        if (disbursement.getStatus() != SalaryDisbursement.DisbursementStatus.PENDING &&
            disbursement.getStatus() != SalaryDisbursement.DisbursementStatus.APPROVED) {
            throw new RuntimeException("Disbursement cannot be processed in current state");
        }

        // Create double-entry ledger entries
        List<AccountingLedger> entries = createSalaryPaymentEntries(disbursement);
        
        // Update disbursement status
        disbursement.setStatus(SalaryDisbursement.DisbursementStatus.DISBURSED);
        disbursement.setLedgerEntryId(entries.get(0).getEntryId());

        return disbursementRepository.save(disbursement);
    }

    private List<AccountingLedger> createSalaryPaymentEntries(SalaryDisbursement d) {
        List<AccountingLedger> entries = new ArrayList<>();
        String refNumber = "SAL-" + d.getDisbursementId().toString().substring(0, 8);
        LocalDate today = LocalDate.now();

        // 1. Debit: Salary Expense Account
        AccountingLedger salaryExpense = AccountingLedger.builder()
                .restaurantId(d.getRestaurantId())
                .transactionDate(today)
                .entryType(AccountingLedger.EntryType.SALARY_PAYMENT)
                .referenceNumber(refNumber)
                .referenceId(d.getDisbursementId())
                .referenceType("SALARY_DISBURSEMENT")
                .description("Salary Payment - " + d.getStaffName())
                .accountId(getOrCreateAccount(d.getRestaurantId(), "5000", "Salaries & Wages", ChartOfAccount.AccountType.EXPENSE).getAccountId())
                .accountCode("5000")
                .accountName("Salaries & Wages")
                .debitAmount(d.getGrossPay())
                .creditAmount(BigDecimal.ZERO)
                .staffId(d.getStaffId())
                .staffName(d.getStaffName())
                .category("SALARY")
                .build();
        entries.add(ledgerRepository.save(salaryExpense));

        // 2. Credit: Cash/Bank Account
        AccountingLedger cashCredit = AccountingLedger.builder()
                .restaurantId(d.getRestaurantId())
                .transactionDate(today)
                .entryType(AccountingLedger.EntryType.SALARY_PAYMENT)
                .referenceNumber(refNumber)
                .referenceId(d.getDisbursementId())
                .referenceType("SALARY_DISBURSEMENT")
                .description("Salary Payment - " + d.getStaffName())
                .accountId(getOrCreateAccount(d.getRestaurantId(), "1000", "Cash", ChartOfAccount.AccountType.ASSET).getAccountId())
                .accountCode("1000")
                .accountName("Cash")
                .debitAmount(BigDecimal.ZERO)
                .creditAmount(d.getNetPay())
                .staffId(d.getStaffId())
                .staffName(d.getStaffName())
                .category("SALARY")
                .build();
        entries.add(ledgerRepository.save(cashCredit));

        // 3. Credit: Tax Payables (Federal, State, Social Security, Medicare)
        if (d.getFederalTax().compareTo(BigDecimal.ZERO) > 0) {
            entries.add(createTaxLedgerEntry(d, "2200", "Federal Tax Payable", d.getFederalTax(), refNumber));
        }
        if (d.getStateTax().compareTo(BigDecimal.ZERO) > 0) {
            entries.add(createTaxLedgerEntry(d, "2210", "State Tax Payable", d.getStateTax(), refNumber));
        }
        if (d.getSocialSecurityTax().compareTo(BigDecimal.ZERO) > 0) {
            entries.add(createTaxLedgerEntry(d, "2220", "Social Security Tax Payable", d.getSocialSecurityTax(), refNumber));
        }
        if (d.getMedicareTax().compareTo(BigDecimal.ZERO) > 0) {
            entries.add(createTaxLedgerEntry(d, "2225", "Medicare Tax Payable", d.getMedicareTax(), refNumber));
        }

        return entries;
    }

    private AccountingLedger createTaxLedgerEntry(SalaryDisbursement d, String accountCode, String accountName, BigDecimal amount, String refNumber) {
        return ledgerRepository.save(AccountingLedger.builder()
                .restaurantId(d.getRestaurantId())
                .transactionDate(LocalDate.now())
                .entryType(AccountingLedger.EntryType.TAX_PAYMENT)
                .referenceNumber(refNumber)
                .referenceId(d.getDisbursementId())
                .referenceType("SALARY_DISBURSEMENT")
                .description("Tax Withholding - " + accountName)
                .accountId(getOrCreateAccount(d.getRestaurantId(), accountCode, accountName, ChartOfAccount.AccountType.LIABILITY).getAccountId())
                .accountCode(accountCode)
                .accountName(accountName)
                .debitAmount(BigDecimal.ZERO)
                .creditAmount(amount)
                .taxAmount(amount)
                .staffId(d.getStaffId())
                .staffName(d.getStaffName())
                .category("TAX")
                .build());
    }

    private ChartOfAccount getOrCreateAccount(Long restaurantId, String code, String name, ChartOfAccount.AccountType type) {
        return chartOfAccountRepository.findByAccountCode(code)
                .orElseGet(() -> chartOfAccountRepository.save(ChartOfAccount.builder()
                        .restaurantId(restaurantId)
                        .accountCode(code)
                        .accountName(name)
                        .accountType(type)
                        .isActive(true)
                        .balance(BigDecimal.ZERO)
                        .build()));
    }

    public List<SalaryDisbursement> getDisbursements(Long restaurantId) {
        return disbursementRepository.findByRestaurantIdOrderByPayDateDesc(restaurantId);
    }

    public List<SalaryDisbursement> getPendingDisbursements(Long restaurantId) {
        return disbursementRepository.findByRestaurantIdAndStatusOrderByPayDateDesc(
                restaurantId, SalaryDisbursement.DisbursementStatus.PENDING);
    }

    // ============ Tax Calculation ============

    public TaxSummaryDto calculateTaxes(BigDecimal grossPay, Long restaurantId, String countryCode) {
        List<TaxConfig> taxes = taxConfigRepository.findByCountryCodeAndIsActiveTrue(countryCode);
        
        // Default US tax rates if not configured
        BigDecimal federalRate = new BigDecimal("0.22"); // 22% federal income tax bracket
        BigDecimal stateRate = new BigDecimal("0.05"); // 5% average state tax
        BigDecimal socialSecurityRate = new BigDecimal("0.062"); // 6.2%
        BigDecimal medicareRate = new BigDecimal("0.0145"); // 1.45%

        // Check if there are configured taxes
        for (TaxConfig tax : taxes) {
            switch (tax.getTaxType()) {
                case FEDERAL_INCOME -> federalRate = tax.getTaxRate();
                case STATE_INCOME -> stateRate = tax.getTaxRate();
                case SOCIAL_SECURITY -> socialSecurityRate = tax.getTaxRate();
                case MEDICARE -> medicareRate = tax.getTaxRate();
            }
        }

        // Calculate taxes
        BigDecimal federalTax = grossPay.multiply(federalRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal stateTax = grossPay.multiply(stateRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal localTax = BigDecimal.ZERO; // No local tax by default
        BigDecimal socialSecurityTax = grossPay.multiply(socialSecurityRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal medicareTax = grossPay.multiply(medicareRate).setScale(2, RoundingMode.HALF_UP);

        // Cap social security at wage base limit ($168,600 for 2024)
        if (grossPay.compareTo(new BigDecimal("168600")) > 0) {
            socialSecurityTax = new BigDecimal("10453.20"); // Max SS tax
        }

        BigDecimal totalTax = federalTax.add(stateTax).add(localTax).add(socialSecurityTax).add(medicareTax);

        TaxSummaryDto summary = new TaxSummaryDto();
        summary.setFederalTax(federalTax);
        summary.setStateTax(stateTax);
        summary.setLocalTax(localTax);
        summary.setSocialSecurityTax(socialSecurityTax);
        summary.setMedicareTax(medicareTax);
        summary.setTotalTax(totalTax);
        summary.setTotalGrossPay(grossPay);
        summary.setTotalNetPay(grossPay.subtract(totalTax));

        return summary;
    }

    public TaxSummaryDto getPayrollTaxSummary(Long restaurantId, LocalDate periodStart, LocalDate periodEnd) {
        List<SalaryDisbursement> disbursements = disbursementRepository.findByRestaurantIdAndPayPeriodStartBetweenOrderByPayDateDesc(
                restaurantId, periodStart, periodEnd);

        BigDecimal totalGross = BigDecimal.ZERO;
        BigDecimal totalFederal = BigDecimal.ZERO;
        BigDecimal totalState = BigDecimal.ZERO;
        BigDecimal totalLocal = BigDecimal.ZERO;
        BigDecimal totalSS = BigDecimal.ZERO;
        BigDecimal totalMedicare = BigDecimal.ZERO;

        for (SalaryDisbursement d : disbursements) {
            if (d.getStatus() == SalaryDisbursement.DisbursementStatus.DISBURSED) {
                totalGross = totalGross.add(d.getGrossPay());
                totalFederal = totalFederal.add(d.getFederalTax());
                totalState = totalState.add(d.getStateTax());
                totalLocal = totalLocal.add(d.getLocalTax());
                totalSS = totalSS.add(d.getSocialSecurityTax());
                totalMedicare = totalMedicare.add(d.getMedicareTax());
            }
        }

        TaxSummaryDto summary = new TaxSummaryDto();
        summary.setFederalTax(totalFederal);
        summary.setStateTax(totalState);
        summary.setLocalTax(totalLocal);
        summary.setSocialSecurityTax(totalSS);
        summary.setMedicareTax(totalMedicare);
        summary.setTotalTax(totalFederal.add(totalState).add(totalLocal).add(totalSS).add(totalMedicare));
        summary.setTotalGrossPay(totalGross);
        summary.setTotalNetPay(totalGross.subtract(summary.getTotalTax()));

        return summary;
    }

    // ============ Process Payroll from Clock-in Data ============

    @Transactional
    public List<SalaryDisbursement> processPayroll(Long restaurantId, LocalDate periodStart, LocalDate periodEnd, LocalDate payDate) {
        // Get all staff with hours in the period
        List<Staff> staffList = staffRepository.findByRestaurantIdAndIsActiveTrue(restaurantId);
        List<SalaryDisbursement> disbursements = new ArrayList<>();

        for (Staff staff : staffList) {
            // Calculate total hours from shifts
            List<StaffShift> shifts = staffShiftRepository.findByRestaurantIdAndClockInBetween(
                    restaurantId, periodStart.atStartOfDay(), periodEnd.plusDays(1).atStartOfDay());
            
            BigDecimal totalMinutes = BigDecimal.ZERO;
            for (StaffShift shift : shifts) {
                if (shift.getClockIn() != null && shift.getClockOut() != null) {
                    long mins = Duration.between(shift.getClockIn(), shift.getClockOut()).toMinutes();
                    totalMinutes = totalMinutes.add(BigDecimal.valueOf(mins));
                }
            }

            if (totalMinutes.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal totalHours = totalMinutes.divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
                BigDecimal hourlyRate = staff.getHourlyRate() != null ? staff.getHourlyRate() : BigDecimal.ZERO;
                BigDecimal grossPay = totalHours.multiply(hourlyRate);

                CreateDisbursementRequest req = new CreateDisbursementRequest();
                req.setStaffId(staff.getStaffId());
                req.setStaffName(staff.getDisplayName());
                req.setPayPeriodStart(periodStart);
                req.setPayPeriodEnd(periodEnd);
                req.setPayDate(payDate);
                req.setHourlyRate(hourlyRate);
                req.setTotalHours(totalHours);
                req.setGrossPay(grossPay);

                SalaryDisbursement disbursement = createSalaryDisbursement(req);
                disbursements.add(disbursement);
            }
        }

        return disbursements;
    }

    // ============ Reports ============

    public TrialBalanceDto getTrialBalance(Long restaurantId, LocalDate startDate, LocalDate endDate) {
        List<Object[]> data = ledgerRepository.getTrialBalance(restaurantId, startDate, endDate);
        
        TrialBalanceDto dto = new TrialBalanceDto();
        dto.setStartDate(startDate);
        dto.setEndDate(endDate);
        
        List<TrialBalanceLine> lines = new ArrayList<>();
        BigDecimal totalDebits = BigDecimal.ZERO;
        BigDecimal totalCredits = BigDecimal.ZERO;

        for (Object[] row : data) {
            TrialBalanceLine line = new TrialBalanceLine();
            line.setAccountId((UUID) row[0]);
            line.setAccountCode((String) row[1]);
            line.setAccountName((String) row[2]);
            BigDecimal debit = (BigDecimal) row[3];
            BigDecimal credit = (BigDecimal) row[4];
            line.setDebit(debit != null ? debit : BigDecimal.ZERO);
            line.setCredit(credit != null ? credit : BigDecimal.ZERO);
            line.setBalance(line.getDebit().subtract(line.getCredit()));
            
            // Get account type
            chartOfAccountRepository.findById(line.getAccountId()).ifPresent(a -> 
                    line.setAccountType(a.getAccountType().name()));
            
            lines.add(line);
            totalDebits = totalDebits.add(line.getDebit());
            totalCredits = totalCredits.add(line.getCredit());
        }

        dto.setLines(lines);
        dto.setTotalDebits(totalDebits);
        dto.setTotalCredits(totalCredits);

        return dto;
    }

    public Map<String, BigDecimal> getDashboardSummary(Long restaurantId) {
        Map<String, BigDecimal> summary = new HashMap<>();

        // Get totals from ledger
        List<Object[]> categoryData = ledgerRepository.getCategorySummary(
                restaurantId, LocalDate.now().withDayOfMonth(1), LocalDate.now());

        BigDecimal revenue = BigDecimal.ZERO;
        BigDecimal expenses = BigDecimal.ZERO;

        for (Object[] row : categoryData) {
            String category = (String) row[0];
            BigDecimal debit = (BigDecimal) row[1];
            BigDecimal credit = (BigDecimal) row[2];
            
            if ("REVENUE".equalsIgnoreCase(category) || "SALES".equalsIgnoreCase(category)) {
                revenue = revenue.add(credit).subtract(debit);
            } else if ("EXPENSE".equalsIgnoreCase(category) || "SALARY".equalsIgnoreCase(category)) {
                expenses = expenses.add(debit).subtract(credit);
            }
        }

        summary.put("revenue", revenue);
        summary.put("expenses", expenses);
        summary.put("netIncome", revenue.subtract(expenses));

        // Outstanding invoices
        BigDecimal outstanding = invoiceRepository.getTotalOutstanding(restaurantId);
        summary.put("outstandingInvoices", outstanding != null ? outstanding : BigDecimal.ZERO);

        // Pending payroll
        BigDecimal pendingPayroll = disbursementRepository.getTotalDisbursedAmount(restaurantId);
        summary.put("pendingPayroll", pendingPayroll != null ? pendingPayroll : BigDecimal.ZERO);

        // Estimated tax due (simplified - 25% of income)
        summary.put("estimatedTaxDue", revenue.multiply(new BigDecimal("0.25")));

        return summary;
    }

    // ============ P&L Statement Generation ============

    public PnLStatementDto generatePnLStatement(Long restaurantId, LocalDate startDate, LocalDate endDate) {
        PnLStatementDto pnl = new PnLStatementDto();
        pnl.setStartDate(startDate);
        pnl.setEndDate(endDate);

        // Get all ledger entries for the period
        List<AccountingLedger> entries = ledgerRepository.findByRestaurantIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                restaurantId, startDate, endDate);

        // Group by account type and category
        Map<String, BigDecimal> revenueByAccount = new HashMap<>();
        Map<String, BigDecimal> cogsByAccount = new HashMap<>();
        Map<String, BigDecimal> laborByAccount = new HashMap<>();
        Map<String, BigDecimal> expenseByAccount = new HashMap<>();

        for (AccountingLedger entry : entries) {
            String accountCode = entry.getAccountCode();
            BigDecimal credit = entry.getCreditAmount() != null ? entry.getCreditAmount() : BigDecimal.ZERO;
            BigDecimal debit = entry.getDebitAmount() != null ? entry.getDebitAmount() : BigDecimal.ZERO;
            BigDecimal netAmount = credit.subtract(debit);

            if (accountCode != null) {
                // Revenue accounts (4000-4999)
                if (accountCode.startsWith("4")) {
                    revenueByAccount.merge(accountCode, netAmount, BigDecimal::add);
                }
                // COGS accounts (5000-5999)
                else if (accountCode.startsWith("5") && !accountCode.startsWith("50")) {
                    // Skip 50xx which is salaries
                    cogsByAccount.merge(accountCode, netAmount.abs(), BigDecimal::add);
                }
                // Labor accounts (6000-6260)
                else if (accountCode.startsWith("6") && (accountCode.startsWith("60") || accountCode.startsWith("61") || accountCode.startsWith("62"))) {
                    laborByAccount.merge(accountCode, netAmount.abs(), BigDecimal::add);
                }
                // Other expenses (6300-7999)
                else if (accountCode.startsWith("6") || accountCode.startsWith("7")) {
                    expenseByAccount.merge(accountCode, netAmount.abs(), BigDecimal::add);
                }
            }
        }

        // Build revenue lines
        pnl.setFoodSales(buildPnLLines(restaurantId, revenueByAccount, "41"));
        pnl.setBeverageSales(buildPnLLines(restaurantId, revenueByAccount, "42"));
        pnl.setOtherRevenue(buildPnLLines(restaurantId, revenueByAccount, Arrays.asList("43", "44", "45", "46", "47", "48", "49")));

        // Build COGS lines
        pnl.setFoodCost(buildPnLLines(restaurantId, cogsByAccount, "51"));
        pnl.setBeverageCost(buildPnLLines(restaurantId, cogsByAccount, "52"));
        pnl.setOtherCogs(buildPnLLines(restaurantId, cogsByAccount, Arrays.asList("53", "54", "55", "56", "57")));

        // Build Labor lines
        pnl.setLaborExpenses(buildPnLLines(restaurantId, laborByAccount, Arrays.asList("60", "61", "62")));

        // Build Operating Expense lines
        pnl.setOperatingExpenses(buildPnLLines(restaurantId, expenseByAccount, Arrays.asList("63", "64", "65", "66", "67", "68", "69", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79")));

        // Calculate totals
        BigDecimal totalRevenue = revenueByAccount.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCogs = cogsByAccount.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalLabor = laborByAccount.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalOperating = expenseByAccount.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);

        pnl.setTotalRevenue(totalRevenue);
        pnl.setTotalCogs(totalCogs);
        pnl.setGrossProfit(totalRevenue.subtract(totalCogs));
        pnl.setTotalLabor(totalLabor);
        pnl.setTotalOperatingExpenses(totalOperating);
        pnl.setTotalExpenses(totalCogs.add(totalLabor).add(totalOperating));
        pnl.setNetIncome(totalRevenue.subtract(pnl.getTotalExpenses()));

        // Calculate percentages
        if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
            pnl.setLaborPercentage(totalLabor.multiply(new BigDecimal("100")).divide(totalRevenue, 2, RoundingMode.HALF_UP));
            pnl.setCogsPercentage(totalCogs.multiply(new BigDecimal("100")).divide(totalRevenue, 2, RoundingMode.HALF_UP));
            pnl.setPrimeCost(totalLabor.add(totalCogs).multiply(new BigDecimal("100")).divide(totalRevenue, 2, RoundingMode.HALF_UP));
        } else {
            pnl.setLaborPercentage(BigDecimal.ZERO);
            pnl.setCogsPercentage(BigDecimal.ZERO);
            pnl.setPrimeCost(BigDecimal.ZERO);
        }

        return pnl;
    }

    private List<PnLLineItem> buildPnLLines(Long restaurantId, Map<String, BigDecimal> data, String prefix) {
        return buildPnLLines(restaurantId, data, Collections.singletonList(prefix));
    }

    private List<PnLLineItem> buildPnLLines(Long restaurantId, Map<String, BigDecimal> data, List<String> prefixes) {
        List<PnLLineItem> lines = new ArrayList<>();
        BigDecimal totalRevenue = chartOfAccountRepository.findByRestaurantIdAndIsActiveTrue(restaurantId).stream()
                .filter(a -> a.getAccountCode() != null && a.getAccountCode().startsWith("4"))
                .map(a -> data.getOrDefault(a.getAccountCode(), BigDecimal.ZERO))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        for (Map.Entry<String, BigDecimal> entry : data.entrySet()) {
            String code = entry.getKey();
            if (prefixes.stream().anyMatch(code::startsWith)) {
                PnLLineItem line = new PnLLineItem();
                line.setAccountCode(code);
                line.setAmount(entry.getValue());
                
                // Get account name
                chartOfAccountRepository.findByAccountCode(code).ifPresent(a -> {
                    line.setAccountId(a.getAccountId());
                    line.setAccountName(a.getAccountName());
                });

                // Calculate percentage of revenue
                if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
                    line.setPercentage(entry.getValue().multiply(new BigDecimal("100")).divide(totalRevenue, 2, RoundingMode.HALF_UP));
                }
                lines.add(line);
            }
        }
        return lines;
    }

    // ============ Auto-populate Sales from Orders ============

    public List<DailySalesDto> getDailySalesFromOrders(Long restaurantId, LocalDate date) {
        List<DailySalesDto> sales = new ArrayList<>();
        
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
        
        // Get all orders for the day
        List<Order> orders = orderRepository.findAllByRestaurantIdAndCreatedAtBetween(
                restaurantId, startOfDay, endOfDay);
        
        // Filter only PAID orders and sum total
        BigDecimal totalOrderAmount = BigDecimal.ZERO;
        int totalOrderCount = 0;
        
        for (Order order : orders) {
            if (order.getStatus() == Order.OrderStatus.PAID) {
                totalOrderAmount = totalOrderAmount.add(order.getTotalAmount());
                totalOrderCount++;
            }
        }
        
        // Group by Menu Cost Group (category) from order lines
        Map<String, SalesData> categoryTotals = new LinkedHashMap<>();
        
        for (Order order : orders) {
            if (order.getStatus() != Order.OrderStatus.PAID) continue;
            
            for (OrderLine line : order.getLines()) {
                if (line.getMenuItem() != null && line.getMenuItem().getGroup() != null) {
                    MenuCostGroup group = line.getMenuItem().getGroup();
                    String categoryKey = group.getName(); // e.g., "Food", "Beverage", "Alcohol"
                    
                    // Map to our sales categories
                    String salesCategory = mapToSalesCategory(categoryKey);
                    String salesLabel = getSalesCategoryLabel(salesCategory);
                    
                    // Use subtotal from order_line (already calculated)
                    BigDecimal lineTotal = line.getSubtotal();
                    
                    categoryTotals.computeIfAbsent(salesCategory, k -> new SalesData(salesLabel, 0, BigDecimal.ZERO));
                    categoryTotals.get(salesCategory).addAmount(lineTotal);
                    categoryTotals.get(salesCategory).incrementCount();
                }
            }
        }
        
        // Convert to DTOs
        for (Map.Entry<String, SalesData> entry : categoryTotals.entrySet()) {
            DailySalesDto dto = new DailySalesDto();
            dto.setDate(date);
            dto.setCategory(entry.getKey());
            dto.setCategoryLabel(entry.getValue().label);
            dto.setAmount(entry.getValue().total);
            dto.setOrderCount(entry.getValue().count);
            
            // Payment breakdown (estimated - in real app would track payment method per order)
            BigDecimal total = entry.getValue().total;
            dto.setCashAmount(total.multiply(new BigDecimal("0.2"))); // 20% cash
            dto.setCardAmount(total.multiply(new BigDecimal("0.7"))); // 70% card
            dto.setDigitalAmount(total.multiply(new BigDecimal("0.1"))); // 10% digital
            sales.add(dto);
        }
        
        // If no category breakdown but we have total, add as single entry
        if (sales.isEmpty() && totalOrderAmount.compareTo(BigDecimal.ZERO) > 0) {
            DailySalesDto dto = new DailySalesDto();
            dto.setDate(date);
            dto.setCategory("food");
            dto.setCategoryLabel("Total Sales");
            dto.setAmount(totalOrderAmount);
            dto.setOrderCount(totalOrderCount);
            dto.setCashAmount(totalOrderAmount.multiply(new BigDecimal("0.2")));
            dto.setCardAmount(totalOrderAmount.multiply(new BigDecimal("0.7")));
            dto.setDigitalAmount(totalOrderAmount.multiply(new BigDecimal("0.1")));
            sales.add(dto);
        }
        
        return sales;
    }
    
    private String mapToSalesCategory(String groupName) {
        if (groupName == null) return "other";
        String lower = groupName.toLowerCase();
        if (lower.contains("food") || lower.contains("appetizer") || lower.contains("main") || lower.contains("dessert")) {
            return "food";
        } else if (lower.contains("alcohol") || lower.contains("wine") || lower.contains("beer") || lower.contains("cocktail")) {
            return "alcohol";
        } else if (lower.contains("beverage") || lower.contains("drink") || lower.contains("non-alcohol")) {
            return "beverage";
        } else if (lower.contains("takeout") || lower.contains("take out") || lower.contains("to-go")) {
            return "takeout";
        } else if (lower.contains("cater")) {
            return "catering";
        }
        return "other";
    }
    
    private String getSalesCategoryLabel(String category) {
        return switch (category) {
            case "food" -> "Food Sales";
            case "beverage" -> "Beverage Sales";
            case "alcohol" -> "Alcohol";
            case "takeout" -> "Takeout/Delivery";
            case "catering" -> "Catering";
            default -> "Other Revenue";
        };
    }
    
    private static class SalesData {
        String label;
        int count;
        BigDecimal total;
        
        SalesData(String label, int count, BigDecimal total) {
            this.label = label;
            this.count = count;
            this.total = total;
        }
        
        void addAmount(BigDecimal amt) {
            this.total = this.total.add(amt);
        }
        void incrementCount() {
            this.count++;
        }
    }
}
