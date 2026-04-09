package mls.sho.dms.application.purchasing.repository;

import mls.sho.dms.entity.PurchaseInvoiceLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PurchaseInvoiceLineRepository extends JpaRepository<PurchaseInvoiceLine, Long> {
    List<PurchaseInvoiceLine> findAllByInvoiceId(Long invoiceId);
}
