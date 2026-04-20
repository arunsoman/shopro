package com.shopro.accounting.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class PayrollDTO {

    @Data
    @Builder
    public static class DisbursementRequest {
        private Long restaurantId;
        private UUID staffId;
        private String staffName;
        private LocalDate payPeriodStart;
        private LocalDate payPeriodEnd;
        private LocalDate payDate;
        private BigDecimal hourlyRate;
        private BigDecimal totalHours;
        private String paymentMethod; // CASH, CHECK, BANK
        private String paymentReference;
        private String approvedBy;
        private String createdBy;
    }

    @Data
    @Builder
    public static class PayrollCalculation {
        private BigDecimal grossPay;
        private BigDecimal federalTax;
        private BigDecimal stateTax;
        private BigDecimal localTax;
        private BigDecimal socialSecurityTax; // Employee side
        private BigDecimal medicareTax; // Employee side
        private BigDecimal employerSocialSecurity; // Employer side
        private BigDecimal employerMedicare; // Employer side
        private BigDecimal totalTaxes;
        private BigDecimal netPay;
    }

    @Data
    @Builder
    public static class DisbursementResponse {
        private UUID disbursementId;
        private String staffName;
        private BigDecimal grossPay;
        private BigDecimal netPay;
        private String status;
        private LocalDate payDate;
    }

    @Data
    @Builder
    public static class PayrollSummary {
        private LocalDate periodStart;
        private LocalDate periodEnd;
        private BigDecimal totalGrossPay;
        private BigDecimal totalNetPay;
        private BigDecimal totalEmployerTaxes;
        private int employeeCount;
    }
}
