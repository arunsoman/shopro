package com.shopro.accounting.controller;

import com.shopro.accounting.dto.CashDTO.*;
import com.shopro.accounting.service.CashManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/accounting/cash")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CashController {

    private final CashManagementService cashManagementService;

    /**
     * Get all liquid account balances (Cash + Bank)
     */
    @GetMapping("/balances")
    public ResponseEntity<List<CashBalanceResponse>> getBalances(
        @RequestParam Long restaurantId
    ) {
        return ResponseEntity.ok(cashManagementService.getLiquidBalances(restaurantId));
    }

    /**
     * Transfer funds between accounts
     */
    @PostMapping("/transfer")
    public ResponseEntity<TransferResponse> transfer(
        @Valid @RequestBody TransferRequest request
    ) {
        return ResponseEntity.ok(cashManagementService.transferFunds(request));
    }
}
