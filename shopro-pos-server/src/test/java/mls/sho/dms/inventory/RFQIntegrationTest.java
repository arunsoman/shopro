package mls.sho.dms.inventory;

import mls.sho.dms.application.dto.inventory.RFQResponse;
import mls.sho.dms.application.service.inventory.RFQService;
import mls.sho.dms.application.service.inventory.SupplierPortalService;
import mls.sho.dms.entity.inventory.*;
import mls.sho.dms.repository.inventory.PurchaseOrderRepository;
import mls.sho.dms.repository.inventory.VendorBidRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
        assertNotNull(bid.getGeneratedPo(), "Bid should have an associated DRAFT PO");
        assertEquals(PurchaseOrderStatus.DRAFT, bid.getGeneratedPo().getStatus());

        // 2. Award the bid
        // Using system actor for staffId
        UUID staffId = UUID.fromString("00000000-0000-0000-0000-000000000000");
        rfqService.awardBid(bidId, staffId);

        // Verify status changes
        bid = bidRepository.findById(bidId).get();
        assertEquals(VendorBidStatus.WON, bid.getStatus());
        assertNotNull(bid.getAwardedAt());
        
        PurchaseOrder po = poRepository.findById(bid.getGeneratedPo().getId()).get();
        assertEquals(PurchaseOrderStatus.SENT, po.getStatus(), "PO should be SENT to supplier after awarding");

        // 3. Supplier Acknowledges the order
        UUID supplierUserId = UUID.fromString("d0000000-0000-0000-0000-000000000001");
        supplierPortalService.acknowledgeOrder(supplierUserId, po.getId());

        // Final Verification
        bid = bidRepository.findById(bidId).get();
        assertEquals(VendorBidStatus.ACKNOWLEDGED, bid.getStatus());
        
        po = poRepository.findById(po.getId()).get();
        assertEquals(PurchaseOrderStatus.ACKNOWLEDGED, po.getStatus());
        assertNotNull(po.getAcknowledgedAt());
    }
}
