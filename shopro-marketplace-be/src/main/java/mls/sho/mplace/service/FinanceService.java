package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.*;
import mls.sho.mplace.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mls.sho.mplace.dto.LedgerStatsDto;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FinanceService {

    private final FinancialTransactionRepository transactionRepository;
    private final SubOrderRepository subOrderRepository;
    private final InvoiceRepository invoiceRepository;

    public List<FinancialTransaction> getAllTransactionsForOperator() {
        return transactionRepository.findAll();
    }

    public List<FinancialTransaction> getAllTransactionsBySupplier(UUID supplierId) {
        return transactionRepository.findAllBySupplier_Id(supplierId);
    }

    public List<FinancialTransaction> getAllTransactionsByRestaurant(UUID restaurantId) {
        return transactionRepository.findAllByRestaurant_Id(restaurantId);
    }

    public record BuyerFinanceStats(double outstandingCommitment, double availableRebates, double platformCredits) {}
    public record SupplierFinanceStats(double totalRevenue, double pendingPayout, double lifetimeEarnings, double currentBalance) {}

    public BuyerFinanceStats getBuyerStats(UUID restaurantId) {
        List<FinancialTransaction> txs = transactionRepository.findAllByRestaurant_Id(restaurantId);
        
        double outstanding = txs.stream()
                .filter(t -> t.getType() == FinancialTransaction.TransactionType.PAYMENT && t.getStatus() == FinancialTransaction.TransactionStatus.PENDING)
                .mapToDouble(t -> t.getAmount().doubleValue())
                .sum();

        double rebates = txs.stream()
                .filter(t -> t.getType() == FinancialTransaction.TransactionType.REBATE)
                .mapToDouble(t -> t.getAmount().doubleValue())
                .sum();

        // Placeholder for credits for now
        return new BuyerFinanceStats(outstanding, rebates, 450.0);
    }

    public SupplierFinanceStats getSupplierStats(UUID supplierId) {
        List<FinancialTransaction> txs = transactionRepository.findAllBySupplier_Id(supplierId);
        double total = txs.stream().filter(t -> t.getType() == FinancialTransaction.TransactionType.PAYMENT).mapToDouble(t -> t.getAmount().doubleValue()).sum();
        double pending = txs.stream().filter(t -> t.getStatus() == FinancialTransaction.TransactionStatus.PENDING).mapToDouble(t -> t.getAmount().doubleValue()).sum();
        
        return new SupplierFinanceStats(total, pending, total, total - pending);
    }

    public List<SubOrder> getFulfilledSubOrders(UUID supplierId) {
        // Get suborders delivered but not yet invoiced
        List<SubOrder> delivered = subOrderRepository.findAllBySupplier_Id(supplierId).stream()
                .filter(s -> s.getStatus() == SubOrder.SubOrderStatus.DELIVERED)
                .toList();

        List<UUID> invoicedSubOrderIds = invoiceRepository.findAllBySubOrder_Supplier_Id(supplierId).stream()
                .map(i -> i.getSubOrder().getId())
                .toList();

        return delivered.stream()
                .filter(s -> !invoicedSubOrderIds.contains(s.getId()))
                .toList();
    }

    public List<Invoice> getSupplierInvoices(UUID supplierId) {
        return invoiceRepository.findAllBySubOrder_Supplier_Id(supplierId);
    }

    public List<FinancialTransaction> getSupplierSettlements(UUID supplierId) {
        return transactionRepository.findAllBySupplier_Id(supplierId).stream()
                .filter(t -> t.getType() == FinancialTransaction.TransactionType.PAYOUT)
                .toList();
    }

    private final LedgerEntryRepository ledgerEntryRepository;
    private final PlatformHoldingRepository holdingRepository;

    @Transactional
    public Invoice createInvoice(UUID subOrderId, String invoiceNumber) {
        SubOrder subOrder = subOrderRepository.findById(subOrderId)
                .orElseThrow(() -> new RuntimeException("SubOrder not found"));

        Invoice invoice = new Invoice();
        invoice.setSubOrder(subOrder);
        invoice.setAmount(subOrder.getTotalAmount());
        invoice.setStatus(Invoice.InvoiceStatus.UNPAID);
        invoice.setIssueDate(java.time.LocalDate.now());
        invoice.setDueDate(java.time.LocalDate.now().plusDays(30));
        
        Invoice saved = invoiceRepository.save(invoice);
        
        // Arrounting Trigger: Supplier Invoice
        recordSupplierPayable(subOrder);
        
        return saved;
    }

    @Transactional
    public void recordSupplierPayable(SubOrder subOrder) {
        FinancialTransaction tx = new FinancialTransaction();
        tx.setDescription("Supplier Payable: " + subOrder.getSupplier().getName());
        tx.setSupplier(subOrder.getSupplier());
        tx.setSubOrder(subOrder);
        tx.setAmount(subOrder.getTotalAmount());
        tx.setType(FinancialTransaction.TransactionType.PAYMENT);
        tx.setStatus(FinancialTransaction.TransactionStatus.COMPLETED);
        tx.setTransactionDate(java.time.LocalDateTime.now());
        transactionRepository.save(tx);

        createLedgerEntry("SUPPLIER_PAYABLE", tx, subOrder.getTotalAmount(), LedgerEntry.EntryType.CREDIT);
    }

    @Transactional
    public void recordRestaurantReceivable(PurchaseOrder po, BigDecimal totalMarkup) {
        FinancialTransaction tx = new FinancialTransaction();
        tx.setDescription("Consolidated Restaurant Invoice: " + po.getReferenceNumber());
        tx.setRestaurant(po.getRestaurant());
        tx.setPurchaseOrder(po);
        tx.setAmount(po.getTotalAmount());
        tx.setType(FinancialTransaction.TransactionType.PAYMENT);
        tx.setStatus(FinancialTransaction.TransactionStatus.COMPLETED);
        tx.setTransactionDate(java.time.LocalDateTime.now());
        transactionRepository.save(tx);

        // 1. Restaurant Receivable
        createLedgerEntry("RESTAURANT_RECEIVABLE", tx, po.getTotalAmount(), LedgerEntry.EntryType.DEBIT);
        
        // 2. Platform Revenue (the Markup Spread)
        createLedgerEntry("PLATFORM_REVENUE", tx, totalMarkup, LedgerEntry.EntryType.CREDIT);
    }

    private void createLedgerEntry(String accountName, FinancialTransaction tx, BigDecimal amount, LedgerEntry.EntryType type) {
        PlatformHolding holding = holdingRepository.findByAccountName(accountName)
                .orElseThrow(() -> new RuntimeException("Holding account not found: " + accountName));

        LedgerEntry entry = new LedgerEntry();
        entry.setHolding(holding);
        entry.setTransaction(tx);
        entry.setAmount(amount);
        entry.setType(type);
        entry.setDescription(tx.getDescription());
        ledgerEntryRepository.save(entry);

        // Update Balance
        if (type == LedgerEntry.EntryType.CREDIT) {
            holding.setBalance(holding.getBalance().add(amount));
        } else {
            holding.setBalance(holding.getBalance().subtract(amount));
        }
        holdingRepository.save(holding);
    }

    @Transactional
    public FinancialTransaction createTransaction(FinancialTransaction transaction) {
        return transactionRepository.save(transaction);
    }

    // ==============================================================
    // ACCOUNTING ENGINE INTEGRATION - NEW METHODS TO BIND EVENTS TO
    // ==============================================================

    /**
     * Triggered when a restaurant pays their invoice.
     */
    @Transactional
    @mls.sho.mplace.accounting.aop.AccountingEvent(
        type = mls.sho.mplace.accounting.aop.AccountingEventType.PAYMENT_RECEIVED,
        amountExpression = "#amount"
    )
    public FinancialTransaction recordRestaurantPayment(UUID poId, BigDecimal amount) {
        // TODO: Implement gateway charge logic
        // 1. Fetch PurchaseOrder
        // 2. Create FinancialTransaction of type PAYMENT
        // 3. transactionRepository.save(tx)
        // 4. Return tx so aspect can read #result.amount
        return null;
    }

    /**
     * Triggered when you pay a supplier for their fulfilled sub-orders.
     */
    @Transactional
    @mls.sho.mplace.accounting.aop.AccountingEvent(
        type = mls.sho.mplace.accounting.aop.AccountingEventType.SUPPLIER_PAID,
        amountExpression = "#amount"
    )
    public FinancialTransaction executeSupplierPayout(UUID supplierId, BigDecimal amount) {
        // TODO: Implement gateway payout logic
        // 1. Create FinancialTransaction of type PAYOUT
        // 2. transactionRepository.save(tx)
        // 3. Return tx so aspect can read #result.amount
        return null;
    }

    /**
     * Triggered when a restaurant invoice is deemed uncollectible.
     */
    @Transactional(readOnly = true)
    public LedgerStatsDto getLedgerStats() {
        // 1. Platform Float
        BigDecimal platformFloat = holdingRepository.findAll().stream()
                .map(PlatformHolding::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. Pending Payouts (Financial Transactions of type PAYOUT and status PENDING)
        BigDecimal pendingPayouts = transactionRepository.findAll().stream()
                .filter(t -> t.getType() == FinancialTransaction.TransactionType.PAYOUT && 
                            t.getStatus() == FinancialTransaction.TransactionStatus.PENDING)
                .map(FinancialTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. Accounts Receivable (Unpaid Invoices)
        BigDecimal accountsReceivable = invoiceRepository.findAll().stream()
                .filter(i -> i.getStatus() == Invoice.InvoiceStatus.UNPAID)
                .map(Invoice::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 4. Settlement Accuracy
        List<FinancialTransaction> allTxs = transactionRepository.findAll();
        long total = allTxs.size();
        long completed = allTxs.stream()
                .filter(t -> t.getStatus() == FinancialTransaction.TransactionStatus.COMPLETED)
                .count();
        
        String accuracy = total > 0 
                ? BigDecimal.valueOf(completed)
                    .multiply(new BigDecimal("100"))
                    .divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP)
                    .toString() + "%"
                : "100.00%";

        return new LedgerStatsDto(platformFloat, pendingPayouts, accountsReceivable, accuracy);
    }
}
