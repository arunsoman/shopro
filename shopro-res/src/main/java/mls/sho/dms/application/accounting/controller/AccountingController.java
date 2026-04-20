package mls.sho.dms.application.accounting.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.accounting.dto.AccountingDtos.*;
import mls.sho.dms.application.accounting.entity.*;
import mls.sho.dms.application.accounting.service.AccountingService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/accounting")
@RequiredArgsConstructor
public class AccountingController {

    private final AccountingService accountingService;

    // ============ Chart of Accounts ============

    @GetMapping("/accounts")
    public ResponseEntity<Map<String, List<ChartOfAccount>>> getAccounts(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(accountingService.getAccountsGrouped(restaurantId));
    }

    @PostMapping("/accounts")
    public ResponseEntity<ChartOfAccount> createAccount(
            @PathVariable Long restaurantId,
            @RequestBody CreateAccountRequest req) {
        req.setRestaurantId(restaurantId);
        return ResponseEntity.ok(accountingService.createAccount(req));
    }

    // ============ Ledger ============

    @GetMapping("/ledger")
    public ResponseEntity<List<AccountingLedger>> getLedger(
            @PathVariable Long restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(accountingService.getLedgerEntries(restaurantId, startDate, endDate));
    }

    @PostMapping("/journal-entry")
    public ResponseEntity<List<AccountingLedger>> createJournalEntry(
            @PathVariable Long restaurantId,
            @RequestBody JournalEntryRequest req) {
        return ResponseEntity.ok(accountingService.createJournalEntry(req));
    }

    // ============ Salary Disbursement ============

    @GetMapping("/disbursements")
    public ResponseEntity<List<SalaryDisbursement>> getDisbursements(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(accountingService.getDisbursements(restaurantId));
    }

    @GetMapping("/disbursements/pending")
    public ResponseEntity<List<SalaryDisbursement>> getPendingDisbursements(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(accountingService.getPendingDisbursements(restaurantId));
    }

    @PostMapping("/disbursements")
    public ResponseEntity<SalaryDisbursement> createDisbursement(
            @PathVariable Long restaurantId,
            @RequestBody CreateDisbursementRequest req) {
        return ResponseEntity.ok(accountingService.createSalaryDisbursement(req));
    }

    @PostMapping("/disbursements/{disbursementId}/disburse")
    public ResponseEntity<SalaryDisbursement> disburseSalary(
            @PathVariable Long restaurantId,
            @PathVariable UUID disbursementId) {
        return ResponseEntity.ok(accountingService.disburseSalary(disbursementId));
    }

    @PostMapping("/disbursements/process-payroll")
    public ResponseEntity<List<SalaryDisbursement>> processPayroll(
            @PathVariable Long restaurantId,
            @RequestBody ProcessPayrollRequest req) {
        return ResponseEntity.ok(accountingService.processPayroll(
                restaurantId, req.getPayPeriodStart(), req.getPayPeriodEnd(), req.getPayDate()));
    }

    // ============ Tax Calculation ============

    @GetMapping("/taxes/calculate")
    public ResponseEntity<TaxSummaryDto> calculateTaxes(
            @PathVariable Long restaurantId,
            @RequestParam BigDecimal grossPay,
            @RequestParam(required = false, defaultValue = "US") String country) {
        return ResponseEntity.ok(accountingService.calculateTaxes(grossPay, restaurantId, country));
    }

    @GetMapping("/taxes/summary")
    public ResponseEntity<TaxSummaryDto> getPayrollTaxSummary(
            @PathVariable Long restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodEnd) {
        return ResponseEntity.ok(accountingService.getPayrollTaxSummary(restaurantId, periodStart, periodEnd));
    }

    // ============ Reports ============

    @GetMapping("/reports/trial-balance")
    public ResponseEntity<TrialBalanceDto> getTrialBalance(
            @PathVariable Long restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(accountingService.getTrialBalance(restaurantId, startDate, endDate));
    }

    @GetMapping("/reports/dashboard")
    public ResponseEntity<Map<String, BigDecimal>> getDashboardSummary(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(accountingService.getDashboardSummary(restaurantId));
    }

    // ============ P&L Statement ============

    @GetMapping("/reports/pnl")
    public ResponseEntity<PnLStatementDto> getPnLStatement(
            @PathVariable Long restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(accountingService.generatePnLStatement(restaurantId, startDate, endDate));
    }

    // ============ Auto-populated Sales from Orders ============

    @GetMapping("/sales/auto-populate")
    public ResponseEntity<List<DailySalesDto>> getAutoPopulatedSales(
            @PathVariable Long restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(accountingService.getDailySalesFromOrders(restaurantId, date));
    }
}
