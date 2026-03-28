package mls.sho.dms.web.controller.finance;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.finance.AccountResponse;
import mls.sho.dms.application.dto.finance.JournalEntryResponse;
import mls.sho.dms.application.dto.finance.PnLResponse;
import mls.sho.dms.application.service.finance.FinancialService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import mls.sho.dms.service.edp.EdpPublisher;
import mls.sho.dms.application.dto.finance.ManualJournalRequest;
import mls.sho.dms.application.dto.finance.BalanceSheetResponse;
import java.util.Map;
import java.util.HashMap;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/v1/finance")
@RequiredArgsConstructor
@Tag(name = "Financial Reports", description = "Accounting ledger and financial performance reports")
public class FinancialReportController {

    private final FinancialService financialService;
    private final EdpPublisher edpPublisher;

    @PostMapping("/entries")
    @Operation(summary = "Post Manual Journal Entry", description = "Submit a manual transaction which will be processed via the EDP bus")
    public void postManualEntry(@RequestBody ManualJournalRequest request) {
        Map<String, Object> eventPayload = new HashMap<>();
        eventPayload.put("description", request.description());
        eventPayload.put("entryDate", request.entryDate());
        eventPayload.put("lines", request.lines());
        
        edpPublisher.publish("finance.manual_entry", eventPayload);
    }

    @PostMapping("/actions/petty-cash")
    @Operation(summary = "Replenish Petty Cash", description = "Record cash movement from main cash (1000) to petty cash (1005)")
    public void replenishPettyCash(@RequestBody Map<String, Object> request) {
        edpPublisher.publish("finance.petty_cash_fetched", request);
    }

    @PostMapping("/actions/expense")
    @Operation(summary = "Record Cash Expense", description = "Record an operational expense paid from petty cash (1005)")
    public void recordExpense(@RequestBody Map<String, Object> request) {
        edpPublisher.publish("finance.cash_expense_paid", request);
    }

    @PostMapping("/actions/staff-advance")
    @Operation(summary = "Pay Staff Advance", description = "Record a staff advance paid from main cash (1000)")
    public void payStaffAdvance(@RequestBody Map<String, Object> request) {
        edpPublisher.publish("finance.staff_advance_paid", request);
    }

    @PostMapping("/actions/bank-deposit")
    @Operation(summary = "Record Bank Deposit", description = "Move cash from main safe (1000) to bank account (1100)")
    public void recordBankDeposit(@RequestBody Map<String, Object> request) {
        edpPublisher.publish("finance.bank_deposit_recorded", request);
    }

    @PostMapping("/actions/utility-payment")
    @Operation(summary = "Pay Utility/Rent", description = "Record payment for utilities or rent from bank account (1100)")
    public void payUtility(@RequestBody Map<String, Object> request) {
        edpPublisher.publish("finance.utility_paid", request);
    }

    @PostMapping("/actions/inventory-waste")
    @Operation(summary = "Log Inventory Waste", description = "Record inventory spoilage or loss (1200) to COGS (5000)")
    public void logWaste(@RequestBody Map<String, Object> request) {
        edpPublisher.publish("finance.inventory_waste_recorded", request);
    }

    @PostMapping("/actions/equity-action")
    @Operation(summary = "Record Equity Action", description = "Record owner capital injection or drawings")
    public void recordEquity(@RequestBody Map<String, Object> request) {
        edpPublisher.publish("finance.equity_action_recorded", request);
    }

    @GetMapping("/accounts")
    @Operation(summary = "Get Chart of Accounts", description = "Fetch all accounting categories and their current balances")
    public List<AccountResponse> getAccounts() {
        return financialService.getAllAccounts();
    }

    @GetMapping("/ledger")
    @Operation(summary = "Get General Ledger", description = "Fetch all journal entries for a given period")
    public List<JournalEntryResponse> getLedger(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to) {
        
        if (to == null) to = Instant.now();
        if (from == null) from = to.minus(30, ChronoUnit.DAYS);
        
        return financialService.getLedger(from, to);
    }

    @GetMapping("/pnl")
    @Operation(summary = "Get Profit & Loss Statement", description = "Fetch the P&L report for a given period")
    public PnLResponse getPnL(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to) {
        
        if (to == null) to = Instant.now();
        if (from == null) from = to.minus(30, ChronoUnit.DAYS);
        
        return financialService.getPnL(from, to);
    }

    @GetMapping("/balance-sheet")
    @Operation(summary = "Get Balance Sheet", description = "Fetch the current financial position (Assets, Liabilities, Equity)")
    public BalanceSheetResponse getBalanceSheet() {
        return financialService.getBalanceSheet();
    }
}
