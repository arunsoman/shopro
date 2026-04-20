package com.shopro.accounting.service;

import com.shopro.accounting.dto.InvoiceDTO.*;
import com.shopro.accounting.entity.ChartOfAccounts;
import com.shopro.accounting.entity.Invoice;
import com.shopro.accounting.entity.LedgerEntry;
import com.shopro.accounting.repository.ChartOfAccountsRepository;
import com.shopro.accounting.repository.InvoiceRepository;
import com.shopro.accounting.repository.LedgerEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final ChartOfAccountsRepository chartOfAccountsRepository;

    /**
     * Records a supplier invoice and creates the initial liability (Accounts Payable)
     */
    @Transactional
    public InvoiceResponse createInvoice(InvoiceRequest request) {
        // 1. Create Invoice record
        Invoice invoice = Invoice.builder()
            .restaurantId(request.getRestaurantId())
            .invoiceNumber(request.getInvoiceNumber())
            .supplierId(request.getSupplierId())
            .supplierName(request.getSupplierName())
            .invoiceDate(request.getInvoiceDate())
            .dueDate(request.getDueDate())
            .subtotal(request.getSubtotal())
            .taxAmount(request.getTaxAmount())
            .discountAmount(request.getDiscountAmount())
            .totalAmount(request.getTotalAmount())
            .status(Invoice.InvoiceStatus.PENDING)
            .paymentTerms(request.getPaymentTerms())
            .referenceNumber(request.getReferenceNumber())
            .createdBy(request.getCreatedBy())
            .build();

        invoice = invoiceRepository.save(invoice);

        // 2. Create Ledger Entries: Debit Expense, Credit Accounts Payable (AP)
        // We assume a default expense account for the supplier's category (e.g., 5100 Food Cost)
        ChartOfAccounts expenseAcc = chartOfAccountsRepository
            .findByRestaurantIdAndAccountCode(request.getRestaurantId(), "5100")
            .orElseThrow(() -> new IllegalStateException("Default expense account 5100 not found"));
        
        ChartOfAccounts apAcc = chartOfAccountsRepository
            .findByRestaurantIdAndAccountCode(request.getRestaurantId(), "2000")
            .orElseThrow(() -> new IllegalStateException("Accounts Payable account 2000 not found"));

        List<LedgerEntry> entries = new ArrayList<>();
        
        // Debit: Expense
        entries.add(LedgerEntry.builder()
            .restaurantId(request.getRestaurantId())
            .transactionDate(request.getInvoiceDate())
            .entryType(LedgerEntry.EntryType.EXPENSE)
            .description("Invoice " + request.getInvoiceNumber() + " from " + request.getSupplierName())
            .accountId(expenseAcc.getAccountId())
            .accountCode(expenseAcc.getAccountCode())
            .accountName(expenseAcc.getAccountName())
            .debitAmount(request.getTotalAmount())
            .creditAmount(BigDecimal.ZERO)
            .category(LedgerEntry.TransactionCategory.EXPENSE)
            .createdBy(request.getCreatedBy())
            .build());

        // Credit: Accounts Payable
        entries.add(LedgerEntry.builder()
            .restaurantId(request.getRestaurantId())
            .transactionDate(request.getInvoiceDate())
            .entryType(LedgerEntry.EntryType.EXPENSE)
            .description("Liability for invoice " + request.getInvoiceNumber())
            .accountId(apAcc.getAccountId())
            .accountCode(apAcc.getAccountCode())
            .accountName(apAcc.getAccountName())
            .debitAmount(BigDecimal.ZERO)
            .creditAmount(request.getTotalAmount())
            .category(LedgerEntry.TransactionCategory.EXPENSE)
            .createdBy(request.getCreatedBy())
            .build());

        ledgerEntryRepository.saveAll(entries);

        return InvoiceResponse.builder()
            .invoiceId(invoice.getInvoiceId())
            .invoiceNumber(invoice.getInvoiceNumber())
            .supplierName(invoice.getSupplierName())
            .totalAmount(invoice.getTotalAmount())
            .paidAmount(BigDecimal.ZERO)
            .status(invoice.getStatus().name())
            .dueDate(invoice.getDueDate())
            .build();
    }

    /**
     * Records payment of a supplier invoice
     */
    @Transactional
    public InvoiceResponse payInvoice(PaymentRequest request) {
        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
            .orElseThrow(() -> new IllegalArgumentException("Invoice not found"));

        if (invoice.getStatus() == Invoice.InvoiceStatus.PAID) {
            throw new IllegalStateException("Invoice is already paid");
        }

        // 1. Update Invoice status
        invoice.setStatus(Invoice.InvoiceStatus.PAID);
        invoice.setPaidAmount(invoice.getTotalAmount());
        invoiceRepository.save(invoice);

        // 2. Double-Entry: Debit Accounts Payable, Credit Cash/Bank
        ChartOfAccounts apAcc = chartOfAccountsRepository
            .findByRestaurantIdAndAccountCode(invoice.getRestaurantId(), "2000")
            .orElseThrow(() -> new IllegalStateException("AP account 2000 not found"));
        
        ChartOfAccounts paymentAcc = chartOfAccountsRepository.findById(request.getPaymentMethodAccountId())
            .orElseThrow(() -> new IllegalStateException("Payment account not found"));

        List<LedgerEntry> entries = new ArrayList<>();

        // Debit: Reduce Liability (AP)
        entries.add(LedgerEntry.builder()
            .restaurantId(invoice.getRestaurantId())
            .transactionDate(request.getPaymentDate())
            .entryType(LedgerEntry.EntryType.PAYMENT)
            .description("Payment for invoice " + invoice.getInvoiceNumber())
            .accountId(apAcc.getAccountId())
            .accountCode(apAcc.getAccountCode())
            .accountName(apAcc.getAccountName())
            .debitAmount(request.getAmount())
            .creditAmount(BigDecimal.ZERO)
            .category(LedgerEntry.TransactionCategory.EXPENSE)
            .createdBy(request.getCreatedBy())
            .build());

        // Credit: Reduce Asset (Cash/Bank)
        entries.add(LedgerEntry.builder()
            .restaurantId(invoice.getRestaurantId())
            .transactionDate(request.getPaymentDate())
            .entryType(LedgerEntry.EntryType.PAYMENT)
            .description("Payment for invoice " + invoice.getInvoiceNumber())
            .accountId(paymentAcc.getAccountId())
            .accountCode(paymentAcc.getAccountCode())
            .accountName(paymentAcc.getAccountName())
            .debitAmount(BigDecimal.ZERO)
            .creditAmount(request.getAmount())
            .category(LedgerEntry.TransactionCategory.EXPENSE)
            .createdBy(request.getCreatedBy())
            .build());

        ledgerEntryRepository.saveAll(entries);

        return InvoiceResponse.builder()
            .invoiceId(invoice.getInvoiceId())
            .invoiceNumber(invoice.getInvoiceNumber())
            .supplierName(invoice.getSupplierName())
            .totalAmount(invoice.getTotalAmount())
            .paidAmount(invoice.getPaidAmount())
            .status(invoice.getStatus().name())
            .dueDate(invoice.getDueDate())
            .build();
    }
}
