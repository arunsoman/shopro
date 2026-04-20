package com.shopro.accounting.repository;

import com.shopro.accounting.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    
    List<Invoice> findByRestaurantIdAndStatus(Long restaurantId, Invoice.InvoiceStatus status);
    
    List<Invoice> findBySupplierId(UUID supplierId);
}
