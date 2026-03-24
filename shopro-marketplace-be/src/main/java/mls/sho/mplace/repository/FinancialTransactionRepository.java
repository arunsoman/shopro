package mls.sho.mplace.repository;

import mls.sho.mplace.entity.FinancialTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface FinancialTransactionRepository extends JpaRepository<FinancialTransaction, UUID> {
    List<FinancialTransaction> findAllByRestaurant_Id(UUID restaurantId);
    List<FinancialTransaction> findAllBySupplier_Id(UUID supplierId);
    List<FinancialTransaction> findAllByPurchaseOrder_Id(UUID poId);
    List<FinancialTransaction> findAllBySubOrder_Id(UUID subOrderId);
}
