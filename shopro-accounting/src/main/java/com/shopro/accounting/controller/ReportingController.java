package com.shopro.accounting.controller;

import com.shopro.accounting.dto.ReportDTO.*;
import com.shopro.accounting.service.ReportingService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/accounting/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReportingController {

    private final ReportingService reportingService;

    @GetMapping("/pnl")
    public ResponseEntity<ProfitAndLoss> getPnL(
        @RequestParam Long restaurantId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        return ResponseEntity.ok(reportingService.generateProfitAndLoss(restaurantId, start, end));
    }

    @GetMapping("/balance-sheet")
    public ResponseEntity<BalanceSheet> getBalanceSheet(
        @RequestParam Long restaurantId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate
    ) {
        return ResponseEntity.ok(reportingService.generateBalanceSheet(restaurantId, asOfDate));
    }

    @GetMapping("/prime-cost")
    public ResponseEntity<PrimeCostReport> getPrimeCost(
        @RequestParam Long restaurantId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        return ResponseEntity.ok(reportingService.generatePrimeCost(restaurantId, start, end));
    }
}
