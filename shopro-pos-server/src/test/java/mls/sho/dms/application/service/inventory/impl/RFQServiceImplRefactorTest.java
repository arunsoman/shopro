package mls.sho.dms.application.service.inventory.impl;

import mls.sho.dms.application.dto.inventory.*;
import mls.sho.dms.application.service.inventory.*;
import mls.sho.dms.entity.inventory.ingredient.RawIngredient;
import mls.sho.dms.entity.inventory.procurement.RFQ;
import mls.sho.dms.entity.inventory.vendor.Supplier;
import mls.sho.dms.entity.inventory.vendor.VendorBid;
import mls.sho.dms.entity.inventory.vendor.VendorBidStatus;
import mls.sho.dms.repository.inventory.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RFQServiceImplRefactorTest {

    @Mock private RFQRepository rfqRepository;
    @Mock private RawIngredientRepository ingredientRepository;
    @Mock private PurchaseOrderRepository purchaseOrderRepository;
    @Mock private SupplierRepository supplierRepository;
    @Mock private VendorBidRepository vendorBidRepository;
    @Mock private SupplierIngredientPricingRepository pricingRepository;
    @Mock private AlertService alertService;
    @Mock private POGeneratorService poGeneratorService;
    @Mock private BiddingStateMachineService stateMachineService;
    @Mock private BidStateMachineService bidStateMachineService;

    @InjectMocks
    private RFQServiceImpl rfqService;

    private UUID rfqId = UUID.randomUUID();
    private UUID ingredientId = UUID.randomUUID();
    private UUID supplierId = UUID.randomUUID();
    private UUID bidId = UUID.randomUUID();
    private UUID staffId = UUID.randomUUID();

    @Test
    void createBid_ShouldCreateRfqAndCallCreateFromRfq() {
        // Arrange
        CreateBidRequest request = new CreateBidRequest(
            List.of(new BidLineItemRequest(ingredientId, BigDecimal.TEN, LocalDate.now())),
            List.of(supplierId),
            Instant.now()
        );

        RawIngredient ingredient = new RawIngredient();
        ingredient.setId(ingredientId);
        
        when(ingredientRepository.findById(ingredientId)).thenReturn(Optional.of(ingredient));
        when(rfqRepository.save(any(RFQ.class))).thenAnswer(i -> {
            RFQ r = i.getArgument(0);
            r.setId(rfqId);
            return r;
        });
        when(supplierRepository.findById(supplierId)).thenReturn(Optional.of(new Supplier()));

        // Act
        rfqService.createBid(request);

        // Assert
        verify(rfqRepository, times(1)).save(any(RFQ.class));
        verify(poGeneratorService, times(1)).createFromRfq(eq(rfqId), any());
    }

    @Test
    void submitBid_ShouldNotCallGenerator() {
        // Arrange
        VendorBidRequest request = new VendorBidRequest(
            supplierId, BigDecimal.TEN, BigDecimal.TEN, LocalDate.now(), "Notes", "NET30"
        );

        RFQ rfq = new RFQ();
        rfq.setId(rfqId);
        Supplier supplier = new Supplier();
        supplier.setId(supplierId);

        when(rfqRepository.findById(rfqId)).thenReturn(Optional.of(rfq));
        when(supplierRepository.findById(supplierId)).thenReturn(Optional.of(supplier));
        when(vendorBidRepository.save(any(VendorBid.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        rfqService.submitBid(rfqId, request);

        // Assert
        verify(vendorBidRepository, atLeastOnce()).save(any(VendorBid.class));
        // Verify that createFromBid is NOT called
        verify(poGeneratorService, never()).createFromBid(any(), any());
    }

    @Test
    void awardBid_ShouldCallAwardPo() {
        // Arrange
        RFQ rfq = new RFQ();
        rfq.setId(rfqId);
        VendorBid bid = new VendorBid();
        bid.setId(bidId);
        bid.setRfq(rfq);
        Supplier supplier = new Supplier();
        bid.setSupplier(supplier);

        when(vendorBidRepository.findById(bidId)).thenReturn(Optional.of(bid));
        when(vendorBidRepository.findByRfqId(rfqId)).thenReturn(List.of(bid));

        // Act
        rfqService.awardBid(bidId, staffId);

        // Assert
        verify(bidStateMachineService).transition(eq(bidId), eq(VendorBidStatus.WON), eq(staffId), anyString());
        verify(poGeneratorService).awardPo(eq(rfqId), eq(bidId), eq(staffId));
    }
}
