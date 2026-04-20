package mls.sho.dms.application.accounting.dto;

import lombok.Data;
import mls.sho.dms.application.accounting.entity.ChartOfAccount;
import mls.sho.dms.application.accounting.entity.AccountingLedger;
import mls.sho.dms.application.accounting.entity.SalaryDisbursement;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class AccountingDtos {

    // ============ Chart of Accounts DTOs ============
    
    @Data
    public static class ChartOfAccountDto {
        private UUID accountId;
        private Long restaurantId;
        private String accountCode;
        private String accountName;
        private ChartOfAccount.AccountType accountType;
        private String accountSubType;
        private UUID parentAccountId;
        private String description;
        private BigDecimal defaultTaxRate;
        private Boolean isTaxable;
        private Boolean isActive;
        private Boolean allowManualEntry;
        private BigDecimal balance;
    }

    @Data
    public static class CreateAccountRequest {
        private Long restaurantId;
        private String accountCode;
        private String accountName;
        private ChartOfAccount.AccountType accountType;
        private String accountSubType;
        private UUID parentAccountId;
        private String description;
        private BigDecimal defaultTaxRate;
        private Boolean isTaxable;
        private Boolean allowManualEntry;
    }

    // ============ Ledger DTOs ============

    @Data
    public static class JournalEntryRequest {
        private LocalDate transactionDate;
        private String description;
        private String referenceNumber;
        private String category;
        private List<JournalEntryLine> lines;

        @Data
        public static class JournalEntryLine {
            private UUID accountId;
            private String accountCode;
            private BigDecimal debit;
            private BigDecimal credit;
            private BigDecimal taxAmount;
            private BigDecimal taxRate;
            private UUID staffId;
            private String staffName;
            private String notes;
        }
    }

    @Data
    public static class LedgerEntryDto {
        private UUID entryId;
        private Long restaurantId;
        private LocalDate transactionDate;
        private String entryType;
        private String referenceNumber;
        private UUID referenceId;
        private String referenceType;
        private String description;
        private UUID accountId;
        private String accountCode;
        private String accountName;
        private BigDecimal debitAmount;
        private BigDecimal creditAmount;
        private BigDecimal taxAmount;
        private BigDecimal taxRate;
        private String currency;
        private UUID staffId;
        private String staffName;
        private String category;
        private String notes;
        private Boolean isReconciled;
        private String createdBy;
        private LocalDateTime createdAt;
    }

    // ============ Salary Disbursement DTOs ============

    @Data
    public static class CreateDisbursementRequest {
        private UUID staffId;
        private String staffName;
        private LocalDate payPeriodStart;
        private LocalDate payPeriodEnd;
        private LocalDate payDate;
        private BigDecimal hourlyRate;
        private BigDecimal totalHours;
        private BigDecimal grossPay;
        private BigDecimal federalTax;
        private BigDecimal stateTax;
        private BigDecimal localTax;
        private BigDecimal socialSecurityTax;
        private BigDecimal medicareTax;
        private BigDecimal otherDeductions;
        private BigDecimal totalTax;
        private BigDecimal netPay;
        private String paymentMethod;
        private String paymentReference;
        private String notes;
    }

    @Data
    public static class DisbursementDto {
        private UUID disbursementId;
        private Long restaurantId;
        private UUID staffId;
        private String staffName;
        private LocalDate payPeriodStart;
        private LocalDate payPeriodEnd;
        private LocalDate payDate;
        private BigDecimal hourlyRate;
        private BigDecimal totalHours;
        private BigDecimal grossPay;
        private BigDecimal federalTax;
        private BigDecimal stateTax;
        private BigDecimal localTax;
        private BigDecimal socialSecurityTax;
        private BigDecimal medicareTax;
        private BigDecimal otherDeductions;
        private BigDecimal totalTax;
        private BigDecimal netPay;
        private String paymentMethod;
        private String paymentReference;
        private String status;
        private UUID ledgerEntryId;
        private String notes;
        private String approvedBy;
        private LocalDateTime approvedAt;
    }

    @Data
    public static class ProcessPayrollRequest {
        private LocalDate payPeriodStart;
        private LocalDate payPeriodEnd;
        private LocalDate payDate;
        private String paymentMethod;
    }

    @Data
    public static class TaxSummaryDto {
        private BigDecimal federalTax;
        private BigDecimal stateTax;
        private BigDecimal localTax;
        private BigDecimal socialSecurityTax;
        private BigDecimal medicareTax;
        private BigDecimal totalTax;
        private BigDecimal totalGrossPay;
        private BigDecimal totalNetPay;
        private List<TaxBreakdownDto> breakdown;
    }

    @Data
    public static class TaxBreakdownDto {
        private String taxType;
        private BigDecimal amount;
        private BigDecimal rate;
        private String accountCode;
    }

    // ============ Invoice DTOs ============

    @Data
    public static class InvoiceDto {
        private UUID invoiceId;
        private Long restaurantId;
        private String invoiceNumber;
        private UUID supplierId;
        private String supplierName;
        private LocalDate invoiceDate;
        private LocalDate dueDate;
        private String invoiceType;
        private String status;
        private BigDecimal subtotal;
        private BigDecimal taxAmount;
        private BigDecimal discountAmount;
        private BigDecimal totalAmount;
        private BigDecimal paidAmount;
        private BigDecimal outstandingAmount;
        private String currency;
        private String description;
        private String notes;
        private String paymentTerms;
    }

    // ============ Financial Reports DTOs ============

    @Data
    public static class TrialBalanceDto {
        private LocalDate startDate;
        private LocalDate endDate;
        private List<TrialBalanceLine> lines;
        private BigDecimal totalDebits;
        private BigDecimal totalCredits;
    }

    @Data
    public static class TrialBalanceLine {
        private UUID accountId;
        private String accountCode;
        private String accountName;
        private String accountType;
        private BigDecimal debit;
        private BigDecimal credit;
        private BigDecimal balance;
    }

    @Data
    public static class BalanceSheetDto {
        private LocalDate asOfDate;
        private List<AccountGroup> assets;
        private List<AccountGroup> liabilities;
        private List<AccountGroup> equity;
        private BigDecimal totalAssets;
        private BigDecimal totalLiabilities;
        private BigDecimal totalEquity;
    }

    @Data
    public static class AccountGroup {
        private String groupName;
        private List<ChartOfAccountDto> accounts;
        private BigDecimal total;
    }

    @Data
    public static class IncomeStatementDto {
        private LocalDate startDate;
        private LocalDate endDate;
        private List<AccountGroup> revenues;
        private List<AccountGroup> expenses;
        private BigDecimal totalRevenue;
        private BigDecimal totalExpenses;
        private BigDecimal netIncome;
    }

    // ============ P&L Statement DTO ============

    @Data
    public static class PnLStatementDto {
        private LocalDate startDate;
        private LocalDate endDate;
        private String reportType; // MONTHLY, QUARTERLY, YEARLY
        
        // Revenue Section
        private List<PnLLineItem> foodSales;
        private List<PnLLineItem> beverageSales;
        private List<PnLLineItem> otherRevenue;
        private BigDecimal totalRevenue;
        
        // COGS Section
        private List<PnLLineItem> foodCost;
        private List<PnLLineItem> beverageCost;
        private List<PnLLineItem> otherCogs;
        private BigDecimal totalCogs;
        private BigDecimal grossProfit;
        
        // Labor Section
        private List<PnLLineItem> laborExpenses;
        private BigDecimal totalLabor;
        
        // Operating Expenses
        private List<PnLLineItem> operatingExpenses;
        private BigDecimal totalOperatingExpenses;
        
        // Summary
        private BigDecimal totalExpenses;
        private BigDecimal netIncome;
        private BigDecimal laborPercentage;
        private BigDecimal cogsPercentage;
        private BigDecimal primeCost;
    }

    @Data
    public static class PnLLineItem {
        private UUID accountId;
        private String accountCode;
        private String accountName;
        private BigDecimal amount;
        private BigDecimal percentage; // Percentage of revenue
    }

    @Data
    public static class DashboardSummaryDto {
        private BigDecimal totalRevenue;
        private BigDecimal totalExpenses;
        private BigDecimal netIncome;
        private BigDecimal totalAssets;
        private BigDecimal totalLiabilities;
        private BigDecimal outstandingInvoices;
        private BigDecimal pendingPayroll;
        private BigDecimal estimatedTaxDue;
        private List<RecentTransaction> recentTransactions;
    }

    @Data
    public static class RecentTransaction {
        private LocalDate date;
        private String description;
        private String category;
        private BigDecimal amount;
        private String type;
    }

    // ============ Auto-populated Sales DTO ============

    @Data
    public static class DailySalesDto {
        private LocalDate date;
        private String category;
        private String categoryLabel;
        private BigDecimal amount;
        private BigDecimal cashAmount;
        private BigDecimal cardAmount;
        private BigDecimal digitalAmount;
        private Integer orderCount;
    }
}
