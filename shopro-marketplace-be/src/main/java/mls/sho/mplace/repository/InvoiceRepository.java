package mls.sho.mplace.repository;

import mls.sho.mplace.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    List<Invoice> findAllBySubOrder_Supplier_Id(UUID supplierId);
    List<Invoice> findAllBySubOrder_Id(UUID subOrderId);
}
