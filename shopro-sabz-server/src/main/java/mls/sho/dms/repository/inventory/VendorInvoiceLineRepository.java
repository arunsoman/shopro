package mls.sho.dms.repository.inventory;

import mls.sho.dms.entity.inventory.VendorInvoiceLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VendorInvoiceLineRepository extends JpaRepository<VendorInvoiceLine, UUID> {
    List<VendorInvoiceLine> findByVendorInvoiceId(UUID vendorInvoiceId);
}
