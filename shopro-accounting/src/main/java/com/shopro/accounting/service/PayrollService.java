package com.shopro.accounting.service;

import com.shopro.accounting.dto.PayrollDTO.*;
import com.shopro.accounting.entity.ChartOfAccounts;
import com.shopro.accounting.entity.LedgerEntry;
import com.shopro.accounting.entity.SalaryDisbursement;
import com.shopro.accounting.entity.TaxConfig;
import com.shopro.accounting.repository.ChartOfAccountsRepository;
import com.shopro.accounting.repository.LedgerEntryRepository;
import com.shopro.accounting.repository.SalaryDisbursementRepository;
import com.shopro.accounting.repository.TaxConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayrollService {

    private final SalaryDisbursementRepository salaryDisbursementRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final ChartOfAccountsRepository chartOfAccountsRepository;
    private final TaxConfigRepository taxConfigRepository;

    /**
     * Calculates payroll taxes based on the current Global Tax Configuration
     */
    public PayrollCalculation calculatePayroll(DisbursementRequest request) {
        BigDecimal grossPay = request.getHourlyRate().multiply(request.getTotalHours());
        
        // Get tax rates from TaxConfig (Sourced from the Global Tax Engine)
        BigDecimal fedRate = getTaxRate("FEDERAL_INCOME", request.getRestaurantId());
        BigDecimal stateRate = getTaxRate("STATE_INCOME", request.getRestaurantId());
        BigDecimal ssRate = new BigDecimal("6.2"); // Standard US SS
        BigDecimal medRate = new BigDecimal("1.45"); // Standard US Medicare

        BigDecimal federalTax = grossPay.multiply(fedRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal stateTax = grossPay.multiply(stateRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal ssTax = grossPay.multiply(ssRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal medTax = grossPay.multiply(medRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal totalTax = federalTax.add(stateTax).add(ssTax).add(medTax);
        BigDecimal netPay = grossPay.subtract(totalTax);

        return PayrollCalculation.builder()
            .grossPay(grossPay)
            .federalTax(federalTax)
            .stateTax(stateTax)
            .localTax(BigDecimal.ZERO)
            .socialSecurityTax(ssTax)
            .medicareTax(medTax)
            .employerSocialSecurity(ssTax) // Matching SS
            .employerMedicare(medTax)  // Matching Medicare
            .totalTaxes(totalTax)
            .netPay(netPay)
            .build();
    }

    /**
     * Processes and posts payroll to the double-entry ledger
     */
    @Transactional
    public DisbursementResponse processPayroll(DisbursementRequest request) {
        PayrollCalculation calc = calculatePayroll(request);
        
        // 1. Create Disbursement record
        SalaryDisbursement disbursement = SalaryDisbursement.builder()
            .restaurantId(request.getRestaurantId())
            .staffId(UUID.randomUUID()) // Simplified for demo
            .staffName(request.getStaffName())
            .payPeriodStart(request.getPayPeriodStart())
            .payPeriodEnd(request.getPayPeriodEnd())
            .payDate(request.getPayDate())
            .hourlyRate(request.getHourlyRate())
            .totalHours(request.getTotalHours())
            .grossPay(calc.getGrossPay())
            .federalTax(calc.getFederalTax())
            .stateTax(calc.getStateTax())
            .socialSecurityTax(calc.getSocialSecurityTax())
            .medicareTax(calc.getMedicareTax())
            .totalTax(calc.getTotalTaxes())
            .netPay(calc.getNetPay())
            .paymentMethod(SalaryDisbursement.PaymentMethod.valueOf(request.getPaymentMethod()))
            .status(SalaryDisbursement.DisbursementStatus.DISBURSED)
            .createdBy(request.getCreatedBy())
            .build();

        salaryDisbursementRepository.save(disbursement);

        // 2. Generate Double-Entry Ledger Entries (The "Golden Rule")
        List<LedgerEntry> entries = new ArrayList<>();
        
        // A. Debit: Wages Expense (Gross Pay)
        entries.add(createEntry(request, "6000", "Wages Expense", calc.getGrossPay(), BigDecimal.ZERO));
        
        // B. Debit: Payroll Tax Expense (Employer match)
        BigDecimal employerTax = calc.getEmployerSocialSecurity().add(calc.getEmployerMedicare());
        entries.add(createEntry(request, "6100", "Payroll Tax Expense", employerTax, BigDecimal.ZERO));
        
        // C. Credit: Cash/Bank (Net Pay)
        entries.add(createEntry(request, "1040", "Bank - Operating", BigDecimal.ZERO, calc.getNetPay()));
        
        // D. Credit: Federal Tax Payable
        entries.add(createEntry(request, "2200", "Federal Tax Payable", BigDecimal.ZERO, calc.getFederalTax()));
        
        // E. Credit: State Tax Payable
        entries.add(createEntry(request, "2200", "State Tax Payable", BigDecimal.ZERO, calc.getStateTax()));
        
        // F. Credit: SS/Medicare Payable
        entries.add(createEntry(request, "2100", "SS/Medicare Payable", BigDecimal.ZERO, calc.getSocialSecurityTax().add(calc.getMedicareTax())));

        ledgerEntryRepository.saveAll(entries);

        return DisbursementResponse.builder()
            .disbursementId(disbursement.getDisbursementId())
            .staffName(disbursement.getStaffName())
            .grossPay(calc.getGrossPay())
            .netPay(calc.getNetPay())
            .status("DISBURSED")
            .payDate(disbursement.getPayDate())
            .build();
    }

    private LedgerEntry createEntry(DisbursementRequest req, String code, String name, BigDecimal debit, BigDecimal credit) {
        ChartOfAccounts acc = chartOfAccountsRepository.findByRestaurantIdAndAccountCode(req.getRestaurantId(), code)
            .orElseThrow(() -> new IllegalStateException("Account not found: " + code));

        return LedgerEntry.builder()
            .restaurantId(req.getRestaurantId())
            .transactionDate(req.getPayDate())
            .entryType(LedgerEntry.EntryType.PAYROLL)
            .description("Payroll for " + req.getStaffName())
            .accountId(acc.getAccountId())
            .accountCode(code)
            .accountName(name)
            .debitAmount(debit)
            .creditAmount(credit)
            .category(LedgerEntry.TransactionCategory.PAYROLL)
            .createdBy(req.getCreatedBy())
            .build();
    }

    private BigDecimal getTaxRate(String type, Long restaurantId) {
        return taxConfigRepository.findByRestaurantId(restaurantId).stream()
            .filter(t -> t.getTaxName().contains(type))
            .map(TaxConfig::getTaxRate)
            .findFirst()
            .orElse(new BigDecimal("0.00"));
    }
}
