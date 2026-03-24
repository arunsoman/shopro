package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.service.FinancialReportingService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/operator/reports")
@RequiredArgsConstructor
public class OperatorReportingController {

    private final FinancialReportingService reportingService;

    @GetMapping("/pnl")
    public Map<String, Object> getPnL(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate
    ) {
        return reportingService.generatePnL(startDate, endDate);
    }

    @GetMapping("/balance-sheet")
    public ResponseEntity<Map<String, Object>> getBalanceSheet(
            @RequestParam(required = false) Instant asOf
    ) {
        return ResponseEntity.ok(reportingService.generateBalanceSheet(asOf != null ? asOf : Instant.now()));
    }

    @GetMapping("/tax-stats")
    public ResponseEntity<Map<String, Object>> getTaxStats() {
        return ResponseEntity.ok(reportingService.getTaxComplianceStats(Instant.now()));
    }
}
