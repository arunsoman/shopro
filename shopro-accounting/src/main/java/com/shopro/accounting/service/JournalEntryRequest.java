package com.shopro.accounting.service;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class JournalEntryRequest {
    private Long restaurantId;
    private LocalDate transactionDate;
    private String referenceNumber;
    private String description;
    private List<JournalEntryLine> lines;
    private String createdBy;

    @Data
    @Builder
    public static class JournalEntryLine {
        private UUID accountId;
        private BigDecimal debitAmount;
        private BigDecimal creditAmount;
    }
}
