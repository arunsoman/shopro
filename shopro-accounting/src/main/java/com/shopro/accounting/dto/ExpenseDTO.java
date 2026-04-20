package com.shopro.accounting.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class ExpenseDTO {

    @Data
    @Builder
    public static class ExpenseCategoryDTO {
        private String code;
        private String name;
        private String group;
    }

    @Data
    @Builder
    public static class PaymentMethodDTO {
        private String code;
        private String name;
        private String type; // CASH, BANK
    }

    @Data
    @Builder
    public static class ExpenseRequest {
        private Long restaurantId;
        private LocalDate date;
        private UUID paymentMethodAccountId;
        private String paymentReference;
        private List<ExpenseLineRequest> lines;
        private boolean isDraft;
    }

    @Data
    @Builder
    public static class ExpenseLineRequest {
        private UUID expenseAccountId;
        private String description;
        private BigDecimal amount;
    }

    @Data
    @Builder
    public static class ExpenseBatchRequest {
        private Long restaurantId;
        private LocalDate date;
        private UUID paymentMethodAccountId;
        private String paymentReference;
        private List<ExpenseLineRequest> lines;
        private String createdBy;
    }

    @Data
    @Builder
    public static class ExpenseResponse {
        private UUID transactionId;
        private LocalDate date;
        private BigDecimal totalAmount;
        private String status; // DRAFT, POSTED
        private List<ExpenseLineResponse> lines;
    }

    @Data
    @Builder
    public static class ExpenseLineResponse {
        private String expenseCategory;
        private String description;
        private BigDecimal amount;
    }

    @Data
    @Builder(toBuilder = true)
    public static class ExpenseBatchResponse {
        private UUID batchId;
        private Long restaurantId;
        private LocalDate date;
        private BigDecimal totalAmount;
        private String status; // DRAFT, POSTED
        private String createdBy;
        private String createdAt;
        private List<ExpenseLineResponse> lines;
        private String paymentMethod;
    }
}
