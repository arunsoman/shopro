package mls.sho.dms.application.service.inventory.job;

import mls.sho.dms.application.service.inventory.AlertService;
import mls.sho.dms.entity.inventory.*;
import mls.sho.dms.entity.staff.StaffRole;
import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.repository.inventory.PurchaseOrderLineRepository;
import mls.sho.dms.repository.inventory.PurchaseOrderRepository;
import mls.sho.dms.repository.inventory.RFQRepository;
import mls.sho.dms.repository.inventory.VendorBidRepository;
import mls.sho.dms.repository.staff.StaffMemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BidScoringJobTest {

    @Mock private RFQRepository rfqRepository;
    @Mock private VendorBidRepository vendorBidRepository;
    @Mock private PurchaseOrderRepository purchaseOrderRepository;
    @Mock private PurchaseOrderLineRepository purchaseOrderLineRepository;
    @Mock private StaffMemberRepository staffMemberRepository;
    @Mock private AlertService alertService;

    @InjectMocks
    private BidScoringJob bidScoringJob;

    private RFQ expiredRfq;
    private RawIngredient ingredient;
    private StaffMember admin;

    @BeforeEach
    void setUp() {
        ingredient = new RawIngredient();
        ingredient.setId(UUID.randomUUID());
        ingredient.setName("Test Tomatoes");

        expiredRfq = new RFQ();
        expiredRfq.setId(UUID.randomUUID());
        expiredRfq.setIngredient(ingredient);
        expiredRfq.setRequiredQty(BigDecimal.valueOf(50));
        expiredRfq.setStatus(RfqStatus.OPEN);
        expiredRfq.setBidDeadline(Instant.now().minus(1, ChronoUnit.HOURS));

        admin = new StaffMember();
        admin.setId(UUID.randomUUID());
        admin.setRole(StaffRole.MANAGER);
    }

    @Test
    void evaluateExpiredRfqs_noBids_extendsDeadlineAndAlerts() {
        when(rfqRepository.findByStatus(RfqStatus.OPEN)).thenReturn(List.of(expiredRfq));
        when(vendorBidRepository.findByRfqIdAndStatus(expiredRfq.getId(), VendorBidStatus.SUBMITTED)).thenReturn(List.of());

        bidScoringJob.evaluateExpiredRfqs();

        verify(rfqRepository).save(expiredRfq);
        assertTrue(expiredRfq.getBidDeadline().isAfter(Instant.now().minus(35, ChronoUnit.MINUTES))); // Extended by 30 mins
        
        verify(alertService).sendNotification(eq("Manager"), contains("RFQ Deadline Extended"), anyString());
        verifyNoInteractions(purchaseOrderRepository);
    }

    @Test
    void evaluateExpiredRfqs_scoresBidsAndAwardsWinner() {
        // Tie breaker scenario: Supplier C wins on price even with same delivery time
        Supplier s1 = new Supplier();
        s1.setCompanyName("Supplier A");
        s1.setVendorRating(BigDecimal.valueOf(80));

        VendorBid b1 = new VendorBid(); // High price, fastest delivery
        b1.setId(UUID.randomUUID());
        b1.setSupplier(s1);
        b1.setUnitPrice(BigDecimal.valueOf(3.50));
        b1.setDeliveryDate(LocalDate.now().plusDays(1));
        b1.setQuantityAvailable(BigDecimal.valueOf(50));
        b1.setStatus(VendorBidStatus.SUBMITTED);

        Supplier s2 = new Supplier();
        s2.setCompanyName("Supplier B");
        s2.setVendorRating(BigDecimal.valueOf(70));

        VendorBid b2 = new VendorBid(); // Slowest delivery
        b2.setId(UUID.randomUUID());
        b2.setSupplier(s2);
        b2.setUnitPrice(BigDecimal.valueOf(2.00));
        b2.setDeliveryDate(LocalDate.now().plusDays(4));
        b2.setQuantityAvailable(BigDecimal.valueOf(50));
        b2.setStatus(VendorBidStatus.SUBMITTED);

        Supplier s3 = new Supplier();
        s3.setCompanyName("Supplier C");
        s3.setVendorRating(BigDecimal.valueOf(85));

        VendorBid b3 = new VendorBid(); // Best balance (Lowest Price + Best Rating + Moderate Delivery) -> Actually, we test tie breaker elsewhere.
        // Let's just make b3 definitively the best score
        b3.setId(UUID.randomUUID());
        b3.setSupplier(s3);
        b3.setUnitPrice(BigDecimal.valueOf(1.90)); 
        b3.setDeliveryDate(LocalDate.now().plusDays(2));
        b3.setQuantityAvailable(BigDecimal.valueOf(50));
        b3.setStatus(VendorBidStatus.SUBMITTED);

        when(rfqRepository.findByStatus(RfqStatus.OPEN)).thenReturn(List.of(expiredRfq));
        when(vendorBidRepository.findByRfqIdAndStatus(expiredRfq.getId(), VendorBidStatus.SUBMITTED))
            .thenReturn(List.of(b1, b2, b3));
        
        when(staffMemberRepository.findAll()).thenReturn(List.of(admin));
        
        PurchaseOrder dummyPo = new PurchaseOrder();
        dummyPo.setId(UUID.randomUUID());
        when(purchaseOrderRepository.save(any(PurchaseOrder.class))).thenReturn(dummyPo);

        bidScoringJob.evaluateExpiredRfqs();

        assertEquals(VendorBidStatus.WON, b3.getStatus());
        assertEquals(VendorBidStatus.LOST, b1.getStatus());
        assertEquals(VendorBidStatus.LOST, b2.getStatus());
        assertEquals(RfqStatus.CLOSED, expiredRfq.getStatus());

        ArgumentCaptor<PurchaseOrder> poCaptor = ArgumentCaptor.forClass(PurchaseOrder.class);
        verify(purchaseOrderRepository).save(poCaptor.capture());
        
        PurchaseOrder savedPo = poCaptor.getValue();
        assertEquals(s3, savedPo.getSupplier());
        assertEquals(PurchaseOrderStatus.DRAFT, savedPo.getStatus());
        assertEquals(BigDecimal.valueOf(95.0), savedPo.getTotalValue()); // 1.90 * 50

        ArgumentCaptor<PurchaseOrderLine> lineCaptor = ArgumentCaptor.forClass(PurchaseOrderLine.class);
        verify(purchaseOrderLineRepository).save(lineCaptor.capture());
        assertEquals(ingredient, lineCaptor.getValue().getIngredient());

        verify(alertService).sendNotification(eq("Manager"), contains("Bid Awarded & PO Drafted"), anyString());
    }
}
