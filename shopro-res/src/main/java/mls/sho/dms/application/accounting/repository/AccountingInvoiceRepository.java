package mls.sho.dms.application.accounting.repository;

import mls.sho.dms.application.accounting.entity.AccountingInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface AccountingInvoiceRepository extends JpaRepository<AccountingInvoice, UUID> {

    List<AccountingInvoice> findByRestaurantIdOrderByInvoiceDateDesc(Long restaurantId);

    List<AccountingInvoice> findByRestaurantIdAndStatus(Long restaurantId, AccountingInvoice.InvoiceStatus status);

    List<AccountingInvoice> findBySupplierIdOrderByInvoiceDateDesc(UUID supplierId);

    List<AccountingInvoice> findByRestaurantIdAndInvoiceDateBetweenOrderByInvoiceDateDesc(
            Long restaurantId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT SUM(i.totalAmount - i.paidAmount) FROM AccountingInvoice i WHERE i.restaurantId = :restaurantId AND i.status IN ('PENDING', 'PARTIALLY_PAID', 'OVERDUE')")
    BigDecimal getTotalOutstanding(Long restaurantId);

    @Query("SELECT SUM(i.paidAmount) FROM AccountingInvoice i WHERE i.restaurantId = :restaurantId AND i.status = 'PAID'")
    BigDecimal getTotalPaid(Long restaurantId);
}
