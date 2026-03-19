package mls.sho.dms.application.service.inventory.impl;

import mls.sho.dms.application.dto.inventory.RFQResponse;
import mls.sho.dms.application.dto.inventory.SupplierDashboardResponse;
import mls.sho.dms.application.dto.inventory.SupplierInventoryView;
import mls.sho.dms.application.service.inventory.AlertService;
import mls.sho.dms.application.service.inventory.BidStateMachineService;
import mls.sho.dms.application.service.inventory.POGeneratorService;
import mls.sho.dms.application.service.inventory.POStateMachineService;
import mls.sho.dms.entity.inventory.*;
import mls.sho.dms.repository.inventory.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SupplierPortalServiceImplTest {

    @Mock private RFQRepository rfqRepository;
    @Mock private VendorBidRepository bidRepository;
    @Mock private SupplierUserRepository userRepository;
    @Mock private SupplierRepository supplierRepository;
    @Mock private SupplierIngredientPricingRepository pricingRepository;
    @Mock private RawIngredientRepository ingredientRepository;
    @Mock private AlertService alertService;
    @Mock private BidStateMachineService bidStateMachineService;
    @Mock private POGeneratorService poGeneratorService;
    @Mock private POStateMachineService poStateMachineService;
    @Mock private PurchaseOrderRepository poRepository;

    @InjectMocks
    private SupplierPortalServiceImpl portalService;

    private UUID supplierId;
    private RawIngredient ing1; // Custom pricing
    private RawIngredient ing2; // Preferred supplier

    @BeforeEach
    void setUp() {
        supplierId = UUID.randomUUID();
        
        ing1 = new RawIngredient();
        ing1.setId(UUID.randomUUID());
        ing1.setName("Ingredient 1");
        ing1.setCostPerUnit(new BigDecimal("10.00"));
        ing1.setParLevel(new BigDecimal("100"));
        ing1.setCurrentStock(new BigDecimal("50"));
        ing1.setUnitOfMeasure("kg");

        ing2 = new RawIngredient();
        ing2.setId(UUID.randomUUID());
        ing2.setName("Ingredient 2");
        ing2.setCostPerUnit(new BigDecimal("20.00"));
        ing2.setParLevel(new BigDecimal("200"));
        ing2.setCurrentStock(new BigDecimal("150"));
        ing2.setUnitOfMeasure("kg");
    }

    @Test
    void getDashboard_CombinesBothSources() {
        // Ing1 via custom pricing
        when(pricingRepository.findByIngredientIdInSupplierCatalog(supplierId))
                .thenReturn(List.of(ing1.getId()));
        
        // Ing2 via preferred supplier
        when(ingredientRepository.findBySupplierId(supplierId))
                .thenReturn(List.of(ing2));
        
        when(rfqRepository.countActiveRfqsByIngredientIds(any(), eq(RfqStatus.OPEN)))
                .thenAnswer(invocation -> {
                    List<UUID> ids = invocation.getArgument(0);
                    assertEquals(2, ids.size());
                    assertTrue(ids.contains(ing1.getId()));
                    assertTrue(ids.contains(ing2.getId()));
                    return 5;
                });

        SupplierDashboardResponse response = portalService.getDashboard(supplierId);
        
        assertEquals(5, response.activeRfqCount());
    }

    @Test
    void getInventoryVisibility_MergesAndDeDuplicates() {
        // Ing1 has custom pricing
        SupplierIngredientPricing pricing = new SupplierIngredientPricing();
        pricing.setIngredient(ing1);
        pricing.setUnitPrice(new BigDecimal("9.50"));
        
        when(pricingRepository.findBySupplierId(supplierId)).thenReturn(List.of(pricing));
        
        // Ing1 and Ing2 have this supplier as preferred
        when(ingredientRepository.findBySupplierId(supplierId)).thenReturn(List.of(ing1, ing2));
        
        List<SupplierInventoryView> inventory = portalService.getInventoryVisibility(supplierId);
        
        assertEquals(2, inventory.size());
        
        SupplierInventoryView view1 = inventory.stream().filter(v -> v.ingredientId().equals(ing1.getId())).findFirst().get();
        assertEquals(9.50, view1.currentVendorPrice()); // Custom price wins
        
        SupplierInventoryView view2 = inventory.stream().filter(v -> v.ingredientId().equals(ing2.getId())).findFirst().get();
        assertEquals(20.00, view2.currentVendorPrice()); // Fallback to costPerUnit
    }

    @Test
    void getActiveRfqs_IncludesPreferredIngredients() {
        when(pricingRepository.findByIngredientIdInSupplierCatalog(supplierId)).thenReturn(new ArrayList<>());
        when(ingredientRepository.findBySupplierId(supplierId)).thenReturn(List.of(ing2));
        
        RFQ rfq = new RFQ();
        rfq.setId(UUID.randomUUID());
        rfq.setIngredient(ing2);
        rfq.setRequiredQty(new BigDecimal("100"));
        rfq.setStatus(RfqStatus.OPEN);
        
        when(rfqRepository.findOpenRfqsByIngredientIds(any(), eq(RfqStatus.OPEN)))
                .thenReturn(List.of(rfq));
        
        List<RFQResponse> rfqs = portalService.getActiveRfqs(supplierId);
        
        assertEquals(1, rfqs.size());
        assertEquals("Ingredient 2", rfqs.get(0).ingredientName());
    }
}
