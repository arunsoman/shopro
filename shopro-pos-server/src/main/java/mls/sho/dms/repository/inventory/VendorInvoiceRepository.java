package mls.sho.dms.repository.inventory;

import mls.sho.dms.entity.inventory.VendorInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VendorInvoiceRepository extends JpaRepository<VendorInvoice, UUID> {
    List<VendorInvoice> findByPurchaseOrderId(UUID purchaseOrderId);
    Optional<VendorInvoice> findByInvoiceNumber(String invoiceNumber);
}
