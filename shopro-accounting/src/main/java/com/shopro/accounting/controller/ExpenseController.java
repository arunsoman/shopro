package com.shopro.accounting.controller;

import com.shopro.accounting.dto.ExpenseDTO.*;
import com.shopro.accounting.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/accounting/expenses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExpenseController {

    private final ExpenseService expenseService;

    /**
     * Get all expense categories for dropdown
     */
    @GetMapping("/categories")
    public ResponseEntity<List<ExpenseCategoryDTO>> getExpenseCategories(
        @RequestParam Long restaurantId
    ) {
        return ResponseEntity.ok(expenseService.getExpenseCategories(restaurantId));
    }

    /**
     * Get all payment methods (Cash, Bank accounts) for dropdown
     */
    @GetMapping("/payment-methods")
    public ResponseEntity<List<PaymentMethodDTO>> getPaymentMethods(
        @RequestParam Long restaurantId
    ) {
        return ResponseEntity.ok(expenseService.getPaymentMethods(restaurantId));
    }

    /**
     * Create expense draft (multiple rows)
     */
    @PostMapping("/draft")
    public ResponseEntity<ExpenseBatchResponse> createExpenseDraft(
        @Valid @RequestBody ExpenseBatchRequest request
    ) {
        return ResponseEntity.ok(expenseService.createDraft(request));
    }

    /**
     * Get all draft expense batches
     */
    @GetMapping("/drafts")
    public ResponseEntity<List<ExpenseBatchResponse>> getDrafts(
        @RequestParam Long restaurantId
    ) {
        return ResponseEntity.ok(expenseService.getDrafts(restaurantId));
    }

    /**
     * Post draft to ledger (creates actual journal entries)
     */
    @PostMapping("/draft/{batchId}/post")
    public ResponseEntity<ExpenseBatchResponse> postDraft(
        @PathVariable UUID batchId,
        @RequestParam String postedBy
    ) {
        return ResponseEntity.ok(expenseService.postDraft(batchId, postedBy));
    }

    /**
     * Delete draft
     */
    @DeleteMapping("/draft/{batchId}")
    public ResponseEntity<Void> deleteDraft(
        @PathVariable UUID batchId
    ) {
        expenseService.deleteDraft(batchId);
        return ResponseEntity.ok().build();
    }

    /**
     * Post single expense directly (no draft)
     */
    @PostMapping
    public ResponseEntity<ExpenseResponse> postExpense(
        @Valid @RequestBody ExpenseRequest request
    ) {
        return ResponseEntity.ok(expenseService.postExpense(request));
    }
}
