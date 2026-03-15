package mls.sho.dms.tax.repository;

import mls.sho.dms.tax.entity.TaxCalculationResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface TaxCalculationResultRepository extends JpaRepository<TaxCalculationResult, java.util.UUID> {
    List<TaxCalculationResult> findByTicketId(UUID ticketId);
    List<TaxCalculationResult> findByTicketItemId(UUID ticketItemId);
    void deleteByTicketId(UUID ticketId);
}
