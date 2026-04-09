package mls.sho.dms.application.purchasing.repository;

import mls.sho.dms.entity.PurchaseInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PurchaseInvoiceRepository extends JpaRepository<PurchaseInvoice, Long> {
    List<PurchaseInvoice> findAllByRestaurantId(Long restaurantId);
    List<PurchaseInvoice> findAllByRestaurantIdAndStatus(Long restaurantId, PurchaseInvoice.InvoiceStatus status);

    @Query("SELECT COUNT(i) FROM PurchaseInvoice i WHERE i.restaurant.id = :restaurantId AND i.status = 'DRAFT'")
    long countDraftInvoices(@Param("restaurantId") Long restaurantId);

    @Query("SELECT DISTINCT i FROM PurchaseInvoice i JOIN FETCH i.lines WHERE i.restaurant.id = :restaurantId AND i.invoiceDate BETWEEN :from AND :to")
    List<PurchaseInvoice> findAllByRestaurantIdAndInvoiceDateBetween(
            @Param("restaurantId") Long restaurantId, 
            @Param("from") LocalDate from, 
            @Param("to") LocalDate to);

    java.util.Optional<PurchaseInvoice> findByGoodsReceiptId(Long grnId);

    List<PurchaseInvoice> findTop3ByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);
}
