package mls.sho.dms.repository.inventory;

import mls.sho.dms.entity.inventory.vendor.VendorBid;
import mls.sho.dms.entity.inventory.vendor.VendorBidStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VendorBidRepository extends JpaRepository<VendorBid, UUID> {
    List<VendorBid> findByRfqIdAndStatus(UUID rfqId, VendorBidStatus status);

    List<VendorBid> findByRfqId(UUID rfqId);

    List<VendorBid> findBySupplierIdAndRfqIdIn(UUID supplierId, java.util.Collection<UUID> rfqIds);

    long countBySupplierIdAndStatus(UUID supplierId, VendorBidStatus status);

    long countBySupplierIdAndStatusAndCreatedAtAfter(UUID supplierId, VendorBidStatus status, java.time.Instant date);

    long countBySupplierIdAndCreatedAtAfter(UUID supplierId, java.time.Instant date);


    @org.springframework.data.jpa.repository.Query("SELECT b FROM VendorBid b WHERE b.status = 'WON' AND b.awardedAt < :cutoffTime")
    List<VendorBid> findWonBidsAwardedBefore(java.time.Instant cutoffTime);
}
