package mls.sho.dms.application.service.inventory.impl;

import mls.sho.dms.entity.inventory.ingredient.RawIngredient;
import mls.sho.dms.entity.inventory.procurement.PurchaseOrder;
import mls.sho.dms.entity.inventory.procurement.PurchaseOrderStatus;
import mls.sho.dms.entity.inventory.procurement.RFQ;
import mls.sho.dms.entity.inventory.vendor.Supplier;
import mls.sho.dms.entity.inventory.vendor.VendorBid;
import mls.sho.dms.entity.inventory.vendor.VendorBidStatus;
import mls.sho.dms.entity.inventory.vendor.VendorPriceProposal;
import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.repository.inventory.PurchaseOrderRepository;
import mls.sho.dms.repository.inventory.VendorBidRepository;
import mls.sho.dms.repository.inventory.VendorPriceProposalRepository;
import mls.sho.dms.repository.staff.StaffRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class POGeneratorServiceTest {

    @Mock
    private PurchaseOrderRepository poRepository;

    @Mock
    private VendorBidRepository bidRepository;

    @Mock
    private VendorPriceProposalRepository proposalRepository;

    @Mock
    private StaffRepository staffRepository;

    @InjectMocks
    private POGeneratorServiceImpl poGeneratorService;

    private UUID bidId;
    private VendorBid bid;
    private UUID proposalId;
    private VendorPriceProposal proposal;
    private Supplier supplier;

    @BeforeEach
    void setUp() {
        bidId = UUID.randomUUID();
        proposalId = UUID.randomUUID();
        supplier = new Supplier();
        supplier.setId(UUID.randomUUID());

        bid = new VendorBid();
        bid.setId(bidId);
        bid.setSupplier(supplier);
        bid.setUnitPrice(new BigDecimal("10.50"));
        bid.setQuantityAvailable(new BigDecimal("100"));
        
        RFQ rfq = new RFQ();
        rfq.setIngredient(new RawIngredient());
        rfq.setRequiredQty(new BigDecimal("50"));
        bid.setRfq(rfq);

        proposal = new VendorPriceProposal();
        proposal.setId(proposalId);
        proposal.setSupplier(supplier);
        proposal.setProposedPrice(new BigDecimal("9.99"));
        proposal.setProposedQuantity(new BigDecimal("20"));
        proposal.setIngredient(new RawIngredient());
    }

    @Test
    void createFromBid_ValidBid_ShouldCreateDraftPo() {
        // Arrange
        UUID staffId = UUID.randomUUID();
        when(staffRepository.findById(staffId)).thenReturn(Optional.of(new StaffMember()));
        when(bidRepository.findById(bidId)).thenReturn(Optional.of(bid));
        when(poRepository.save(any(PurchaseOrder.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        PurchaseOrder po = poGeneratorService.createFromBid(bidId, staffId);

        // Assert
        assertNotNull(po);
        assertEquals(PurchaseOrderStatus.DRAFT, po.getStatus());
        assertEquals(supplier, po.getSupplier());
        assertEquals(bidId, po.getSourceBidId());
        verify(bidRepository).save(bid);
        assertEquals(VendorBidStatus.WON, bid.getStatus());
    }

    @Test
    void createFromProposal_ValidProposal_ShouldCreateDraftPo() {
        // Arrange
        UUID staffId = UUID.randomUUID();
        when(staffRepository.findById(staffId)).thenReturn(Optional.of(new StaffMember()));
        when(proposalRepository.findById(proposalId)).thenReturn(Optional.of(proposal));
        when(poRepository.save(any(PurchaseOrder.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        PurchaseOrder po = poGeneratorService.createFromProposal(proposalId, staffId);

        // Assert
        assertNotNull(po);
        assertEquals(PurchaseOrderStatus.DRAFT, po.getStatus());
        assertEquals(supplier, po.getSupplier());
        assertEquals(proposalId, po.getSourceProposalId());
        verify(proposalRepository).save(proposal);
    }
}
