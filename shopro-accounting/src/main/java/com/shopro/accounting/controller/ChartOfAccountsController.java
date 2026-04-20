package com.shopro.accounting.controller;

import com.shopro.accounting.entity.ChartOfAccounts;
import com.shopro.accounting.repository.ChartOfAccountsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/accounting/chart-of-accounts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChartOfAccountsController {

    private final ChartOfAccountsRepository chartOfAccountsRepository;

    @GetMapping
    public ResponseEntity<List<ChartOfAccounts>> getAccounts(
        @RequestParam Long restaurantId
    ) {
        return ResponseEntity.ok(
            chartOfAccountsRepository.findByRestaurantIdOrderByAccountCode(restaurantId)
        );
    }
}
