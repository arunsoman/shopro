package mls.sho.dms.repository.inventory;

import mls.sho.dms.entity.inventory.VendorBid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VendorBidRepository extends JpaRepository<VendorBid, UUID> {
    List<VendorBid> findByRfqIdAndStatus(UUID rfqId, mls.sho.dms.entity.inventory.VendorBidStatus status);
}
