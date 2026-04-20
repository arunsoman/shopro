package com.shopro.accounting.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

public class TaxDTO {

    @Data
    @Builder
    public static class TaxConfigRequest {
        private Long restaurantId;
        private String taxName;
        private String taxCode;
        private BigDecimal rate;
        private String countryCode;
        private Integer priority;
        private String category;
        private boolean isActive;
    }

    @Data
    @Builder
    public static class TaxCalculationResponse {
        private String taxName;
        private BigDecimal amount;
        private BigDecimal rate;
    }

    @Data
    @Builder
    public static class TaxSummaryResponse {
        private BigDecimal totalTaxAmount;
        private List<TaxCalculationResponse> breakDown;
    }
}
