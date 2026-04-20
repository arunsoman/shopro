package com.shopro.accounting.controller;

import com.shopro.accounting.dto.PayrollDTO.*;
import com.shopro.accounting.service.PayrollService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/accounting/payroll")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PayrollController {

    private final PayrollService payrollService;

    /**
     * Calculate payroll without posting to ledger (Preview mode)
     */
    @PostMapping("/calculate")
    public ResponseEntity<PayrollCalculation> calculate(
        @Valid @RequestBody DisbursementRequest request
    ) {
        return ResponseEntity.ok(payrollService.calculatePayroll(request));
    }

    /**
     * Process and post payroll to ledger
     */
    @PostMapping("/process")
    public ResponseEntity<DisbursementResponse> process(
        @Valid @RequestBody DisbursementRequest request
    ) {
        return ResponseEntity.ok(payrollService.processPayroll(request));
    }
}
