package mls.sho.mplace.repository;

import mls.sho.mplace.entity.ComplianceDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface ComplianceDocumentRepository extends JpaRepository<ComplianceDocument, UUID> {
    List<ComplianceDocument> findAllByRestaurant_Id(UUID restaurantId);
    List<ComplianceDocument> findAllBySupplier_Id(UUID supplierId);
}
