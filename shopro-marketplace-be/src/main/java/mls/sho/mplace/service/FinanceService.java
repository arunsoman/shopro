package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.FinancialTransaction;
import mls.sho.mplace.repository.FinancialTransactionRepository;
import mls.sho.mplace.util.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FinanceService {

    private final FinancialTransactionRepository transactionRepository;
    private final SecurityUtils securityUtils;

    public List<FinancialTransaction> getAllTransactions() {
        var requester = securityUtils.getCurrentRequester();
        if (requester == null) return Collections.emptyList();

        if (requester.isBuyer()) {
            return transactionRepository.findAllByRestaurant_Id(requester.restaurantId());
        } else if (requester.isSupplier()) {
            return transactionRepository.findAllBySupplier_Id(requester.supplierId());
        } else {
            return transactionRepository.findAll();
        }
    }

    public record BuyerFinanceStats(double outstandingCommitment, double availableRebates, double platformCredits) {}
    public record SupplierFinanceStats(double totalRevenue, double pendingPayout, double lifetimeEarnings, double currentBalance) {}

    public BuyerFinanceStats getBuyerStats() {
        var requester = securityUtils.getCurrentRequester();
        if (requester == null || !requester.isBuyer()) return new BuyerFinanceStats(0, 0, 0);

        List<FinancialTransaction> txs = transactionRepository.findAllByRestaurant_Id(requester.restaurantId());
        
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

    public SupplierFinanceStats getSupplierStats() {
        var requester = securityUtils.getCurrentRequester();
        if (requester == null || !requester.isSupplier()) return new SupplierFinanceStats(0, 0, 0, 0);

        List<FinancialTransaction> txs = transactionRepository.findAllBySupplier_Id(requester.supplierId());
        double total = txs.stream().filter(t -> t.getAmount().doubleValue() > 0).mapToDouble(t -> t.getAmount().doubleValue()).sum();
        double pending = txs.stream().filter(t -> t.getStatus() == FinancialTransaction.TransactionStatus.PENDING).mapToDouble(t -> t.getAmount().doubleValue()).sum();
        
        return new SupplierFinanceStats(total, pending, total, total - pending);
    }

    @Transactional
    public FinancialTransaction createTransaction(FinancialTransaction transaction) {
        // Business logic for financial orchestration would go here
        return transactionRepository.save(transaction);
    }
}
