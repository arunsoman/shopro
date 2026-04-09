package mls.sho.dms.inventory;

import mls.sho.dms.application.dto.inventory.RFQResponse;
import mls.sho.dms.application.service.inventory.RFQService;
import mls.sho.dms.application.service.inventory.SupplierPortalService;
import mls.sho.dms.entity.inventory.procurement.PurchaseOrder;
import mls.sho.dms.entity.inventory.procurement.PurchaseOrderStatus;
import mls.sho.dms.entity.inventory.procurement.RfqStatus;
import mls.sho.dms.entity.inventory.vendor.VendorBid;
import mls.sho.dms.entity.inventory.vendor.VendorBidStatus;
import mls.sho.dms.repository.inventory.PurchaseOrderRepository;
import mls.sho.dms.repository.inventory.VendorBidRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class RFQIntegrationTest {

    @Autowired
    private RFQService rfqService;

    @Autowired
    private SupplierPortalService supplierPortalService;

    @Autowired
    private VendorBidRepository bidRepository;

    @Autowired
    private PurchaseOrderRepository poRepository;

    @Test
    void testBidAwardToAcknowledgmentFlow() {
        // 1. Verify seeded RFQs are retrievable (Fixes 500 error verification)
        List<RFQResponse> rfqs = rfqService.getAllRfqs(RfqStatus.OPEN);
        assertFalse(rfqs.isEmpty(), "Seeded RFQs should be present");
        
        // Find our seeded bid (f0000000-0000-0000-0000-000000000001)
        UUID bidId = UUID.fromString("f0000000-0000-0000-0000-000000000001");
        VendorBid bid = bidRepository.findById(bidId)
            .orElseThrow(() -> new RuntimeException("Seeded bid not found"));
        
        assertEquals(VendorBidStatus.SUBMITTED, bid.getStatus());
        
        // Debug: Check if PO exists by literal ID from V73
        UUID expectedPoId = UUID.fromString("fba9810d-5e65-4112-96ab-9831421ae582");
        Optional<PurchaseOrder> poById = poRepository.findById(expectedPoId);
        assertTrue(poById.isPresent(), "PO should be findable by literal ID: " + expectedPoId);
        assertEquals(bid.getRfq().getId(), poById.get().getRfq().getId(), "PO's RFQ ID should match");

        PurchaseOrder po = poRepository.findByRfq(bid.getRfq())
            .orElseThrow(() -> new RuntimeException("PO not found for RFQ: " + bid.getRfq().getId()));
        assertEquals(PurchaseOrderStatus.DRAFT, po.getStatus());

        // 2. Award the bid
        // Using system actor for staffId
        UUID staffId = UUID.fromString("00000000-0000-0000-0000-000000000000");
        rfqService.awardBid(bidId, staffId);

        // Verify status changes
        VendorBid awardedBid = bidRepository.findById(bidId).get();
        assertEquals(VendorBidStatus.WON, awardedBid.getStatus());
        assertNotNull(awardedBid.getAwardedAt());
        
        PurchaseOrder awardedPo = poRepository.findByRfq(awardedBid.getRfq()).get();
        assertEquals(PurchaseOrderStatus.SENT, awardedPo.getStatus(), "PO should be SENT to supplier after awarding");

        // 3. Supplier Acknowledges the order
        UUID supplierUserId = UUID.fromString("d0000000-0000-0000-0000-000000000001");
        supplierPortalService.acknowledgeOrder(supplierUserId, awardedPo.getId());

        // Final Verification
        VendorBid finalBid = bidRepository.findById(bidId).get();
        assertEquals(VendorBidStatus.ACKNOWLEDGED, finalBid.getStatus());
        
        PurchaseOrder finalPo = poRepository.findById(awardedPo.getId()).get();
        assertEquals(PurchaseOrderStatus.ACKNOWLEDGED, finalPo.getStatus());
        assertNotNull(finalPo.getAcknowledgedAt());
    }
}
