package mls.sho.mplace.controller;
import mls.sho.mplace.service.FinanceService;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * Supplier Finance Controller
 * Scoped to /api/supplier/**
 */
@RestController
@RequestMapping("/api/supplier/finance")
@RequiredArgsConstructor
public class SupplierFinanceController {

    private final mls.sho.mplace.service.FinanceService financeService;
    private final mls.sho.mplace.util.SecurityUtils securityUtils;

    public record Transaction(String id, String date, String description, double amount, String status) {}

    @GetMapping("/stats")
    public FinanceService.SupplierFinanceStats getStats() {
        return financeService.getSupplierStats();
    }

    @GetMapping("/transactions")
    public List<Transaction> getTransactions() {
        return financeService.getAllTransactions().stream()
                .map(t -> new Transaction(
                        t.getId().toString(),
                        t.getCreatedAt().toString(),
                        t.getDescription(),
                        t.getAmount().doubleValue(),
                        t.getStatus().name()
                )).toList();
    }
}
