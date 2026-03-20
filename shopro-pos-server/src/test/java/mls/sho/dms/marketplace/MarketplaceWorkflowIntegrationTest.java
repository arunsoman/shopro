package mls.sho.dms.marketplace;

import mls.sho.dms.application.controller.marketplace.MarketplaceRFQController;
import mls.sho.dms.application.controller.marketplace.MarketplaceRFQDTO;
import mls.sho.dms.application.security.MarketplaceUserPrincipal;
import mls.sho.dms.application.service.marketplace.MarketplaceService;
import mls.sho.dms.entity.inventory.*;
import mls.sho.dms.entity.marketplace.*;
import mls.sho.dms.repository.inventory.PurchaseOrderRepository;
import mls.sho.dms.repository.inventory.RawIngredientRepository;
import mls.sho.dms.repository.inventory.SupplierRepository;
import mls.sho.dms.repository.inventory.RFQRepository;
import mls.sho.dms.repository.marketplace.PlatformTransactionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class MarketplaceWorkflowIntegrationTest {

    @Autowired
    private MarketplaceService marketplaceService;

    @Autowired
    private MarketplaceRFQController rfqController;

    @Autowired
    private PurchaseOrderRepository poRepository;

    @Autowired
    private PlatformTransactionRepository txRepository;

    @Autowired
    private RawIngredientRepository ingredientRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private RFQRepository rfqRepository;

    @Test
    void testDoublePOAndFinancialLedger() {
        // 1. Setup Data
        Supplier supplier = new Supplier();
        supplier.setCompanyName("Test Supplier " + UUID.randomUUID());
        supplierRepository.save(supplier);

        RawIngredient ingredient = new RawIngredient();
        ingredient.setName("Test Ingredient " + UUID.randomUUID());
        ingredient.setUnitOfMeasure("KG");
        ingredient.setCostPerUnit(new BigDecimal("10.00"));
        ingredientRepository.save(ingredient);

        // 2. Create Customer PO (CPO)
        PurchaseOrder cpo = new PurchaseOrder();
        cpo.setSupplier(supplier);
        cpo.setPoType(POType.CUSTOMER_SALES);
        cpo.setStatus(PurchaseOrderStatus.DRAFT);

        PurchaseOrderLine line = new PurchaseOrderLine();
        line.setPurchaseOrder(cpo);
        line.setIngredient(ingredient);
        line.setOrderedQty(new BigDecimal("100"));
        line.setUnitCost(new BigDecimal("15.00")); // Retail price to restaurant
        cpo.getLines().add(line);

        cpo.calculateTotalValue();
        poRepository.save(cpo);

        // 3. Process Marketplace Fulfillment
        List<PurchaseOrder> spos = marketplaceService.fulfillCPO(cpo);
        assertEquals(1, spos.size());
        PurchaseOrder spo = spos.get(0);

        // 4. Verify Double-PO
        assertNotNull(spo);
        assertEquals(POType.INTERNAL_PROCUREMENT, spo.getPoType());
        assertEquals(cpo.getId(), spo.getRelatedPoId());
        assertEquals(supplier.getId(), spo.getSupplier().getId());
        assertEquals(PurchaseOrderStatus.APPROVED, spo.getStatus()); // Note: Service set it to APPROVED

        // Verify Lines
        assertEquals(1, spo.getLines().size());
        PurchaseOrderLine spoLine = spo.getLines().get(0);
        assertEquals(new BigDecimal("100.0000"), spoLine.getOrderedQty().setScale(4));
        // Verify unit cost (cloned)
        assertEquals(new BigDecimal("15.0000"), spoLine.getUnitCost().setScale(4));

        // 5. Verify Financial Ledger
        assertNotNull(spo.getPlatformTxId());
        PlatformTransaction tx = txRepository.findById(spo.getPlatformTxId()).orElseThrow();
        
        BigDecimal expectedCaptured = new BigDecimal("1500.0000"); // 100 * 15.00
        BigDecimal expectedFee = expectedCaptured.multiply(new BigDecimal("0.05")).setScale(4, java.math.RoundingMode.HALF_UP);
        BigDecimal expectedPayout = expectedCaptured.subtract(expectedFee).setScale(4, java.math.RoundingMode.HALF_UP);

        assertEquals(expectedCaptured, tx.getTotalCapturedAmount().setScale(4));
        assertEquals(expectedPayout, tx.getSupplierPayoutAmount().setScale(4));
        assertEquals(expectedFee, tx.getFeeAmount().setScale(4));
    }

    @Test
    void testRFQIdentityMasking() {
        // 1. Setup Data
        RawIngredient ingredient = new RawIngredient();
        ingredient.setName("Masked Ingredient " + UUID.randomUUID());
        ingredient.setUnitOfMeasure("EA");
        ingredient.setCostPerUnit(BigDecimal.ONE);
        ingredientRepository.save(ingredient);

        UUID restaurantId = UUID.randomUUID();
        RFQ rfq = new RFQ();
        rfq.setIngredient(ingredient);
        rfq.setRequiredQty(new BigDecimal("50"));
        rfq.setDesiredDeliveryDate(LocalDate.now().plusDays(7));
        rfq.setBidDeadline(Instant.now().plusSeconds(3600));
        rfq.setStatus(RfqStatus.OPEN);
        rfq.setRestaurantId(restaurantId);
        rfqRepository.save(rfq);

        // 2. Mock Principal
        MarketplaceUser user = new MarketplaceUser();
        user.setId(UUID.randomUUID());
        user.setUsername("test-supplier-" + UUID.randomUUID());
        user.setRole(MarketplaceRole.MARKETPLACE_SELLER);
        user.setAssociatedEntityId(UUID.randomUUID());
        MarketplaceUserPrincipal principal = new MarketplaceUserPrincipal(user);

        // 3. Call Controller directly (to test masking logic)
        ResponseEntity<List<MarketplaceRFQDTO>> response = rfqController.getActiveRFQs(principal);
        
        // 4. Verify Masking
        assertEquals(200, response.getStatusCodeValue());
        List<MarketplaceRFQDTO> dtos = response.getBody();
        assertNotNull(dtos);
        boolean found = false;
        for (MarketplaceRFQDTO dto : dtos) {
            if (dto.getId().equals(rfq.getId().toString())) {
                found = true;
                assertTrue(dto.getBuyerName().startsWith("Verified Restaurant "));
                assertFalse(dto.getBuyerName().contains(restaurantId.toString()));
                assertEquals(ingredient.getName(), dto.getIngredientName());
            }
        }
        assertTrue(found, "RFQ should be found in active list");
    }
}
