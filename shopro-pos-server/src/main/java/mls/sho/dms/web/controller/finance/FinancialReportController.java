package mls.sho.dms.web.controller.finance;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.finance.AccountResponse;
import mls.sho.dms.application.dto.finance.JournalEntryResponse;
import mls.sho.dms.application.dto.finance.PnLResponse;
import mls.sho.dms.application.service.finance.FinancialService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/v1/finance")
@RequiredArgsConstructor
@Tag(name = "Financial Reports", description = "Accounting ledger and financial performance reports")
public class FinancialReportController {

    private final FinancialService financialService;

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
}
