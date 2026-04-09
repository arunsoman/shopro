package mls.sho.dms.repository.inventory;

import mls.sho.dms.entity.inventory.vendor.VendorPriceProposal;
import mls.sho.dms.entity.inventory.vendor.VendorPriceProposalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VendorPriceProposalRepository extends JpaRepository<VendorPriceProposal, UUID> {
    List<VendorPriceProposal> findByStatusOrderByCreatedAtDesc(VendorPriceProposalStatus status);
    List<VendorPriceProposal> findByStatusNotOrderByReviewedAtDesc(VendorPriceProposalStatus status);
    List<VendorPriceProposal> findBySupplierIdOrderByCreatedAtDesc(UUID supplierId);
}
