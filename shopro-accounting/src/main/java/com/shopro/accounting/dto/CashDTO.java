package com.shopro.accounting.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class CashDTO {

    @Data
    @Builder
    public static class TransferRequest {
        private Long restaurantId;
        private UUID fromAccountId;
        private UUID toAccountId;
        private BigDecimal amount;
        private LocalDate transactionDate;
        private String reference;
        private String description;
        private String createdBy;
    }

    @Data
    @Builder
    public static class CashBalanceResponse {
        private UUID accountId;
        private String accountName;
        private String accountCode;
        private BigDecimal balance;
        private String accountType; // CASH, BANK
    }

    @Data
    @Builder
    public static class TransferResponse {
        private UUID transactionId;
        private boolean success;
        private String message;
    }
}
