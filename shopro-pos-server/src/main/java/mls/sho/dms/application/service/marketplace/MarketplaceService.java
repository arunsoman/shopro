package mls.sho.dms.application.service.marketplace;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.entity.inventory.procurement.POType;
import mls.sho.dms.entity.inventory.procurement.PurchaseOrder;
import mls.sho.dms.entity.inventory.procurement.PurchaseOrderLine;
import mls.sho.dms.entity.inventory.procurement.PurchaseOrderStatus;
import mls.sho.dms.entity.inventory.vendor.Supplier;
import mls.sho.dms.entity.marketplace.PlatformTransaction;
import mls.sho.dms.repository.inventory.PurchaseOrderRepository;
import mls.sho.dms.repository.marketplace.PlatformTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketplaceService {

    private final PurchaseOrderRepository poRepository;
    private final PlatformTransactionRepository transactionRepository;

    /**
     * Converts a CustomerPurchaseOrder (CPO) from a Restaurant into a SupplierPurchaseOrder (SPO) for the Supplier.
     * This is the "Double-PO" core logic.
     */
    @Transactional
    public List<PurchaseOrder> fulfillCPO(PurchaseOrder cpo) {
        if (cpo.getPoType() != POType.CUSTOMER_SALES) {
            throw new IllegalArgumentException("Only CUSTOMER_SALES POs can be fulfilled via Marketplace.");
        }

        log.info("Fulfilling CustomerPurchaseOrder: {} from Restaurant context", cpo.getId());

        List<PurchaseOrder> spos = new ArrayList<>();
        
        // Simplified Logic: For each line, we might have a different supplier if not already assigned.
        // In the facilitator model, the CPO might already have a chosen supplier if it came from a Bid.
        
        if (cpo.getSupplier() != null) {
            PurchaseOrder spo = createSPOFromCPO(cpo, cpo.getSupplier());
            spos.add(spo);
        } else {
            // Logic for multi-supplier fulfillment would go here
            log.warn("CPO {} has no supplier assigned. In a full marketplace flow, this should be split by winning bid suppliers.", cpo.getId());
        }

        return spos;
    }

    private PurchaseOrder createSPOFromCPO(PurchaseOrder cpo, Supplier supplier) {
        PurchaseOrder spo = new PurchaseOrder();
        spo.setPoType(POType.INTERNAL_PROCUREMENT);
        spo.setSupplier(supplier);
        spo.setRelatedPoId(cpo.getId());
        spo.setStatus(PurchaseOrderStatus.APPROVED); // Automatically approve since Shopro is facilitating
        spo.setOrderType(cpo.getOrderType());
        spo.setExpectedDeliveryDate(cpo.getExpectedDeliveryDate());
        
        // Clone lines
        for (PurchaseOrderLine cpoLine : cpo.getLines()) {
            PurchaseOrderLine spoLine = new PurchaseOrderLine();
            spoLine.setPurchaseOrder(spo);
            spoLine.setIngredient(cpoLine.getIngredient());
            spoLine.setOrderedQty(cpoLine.getOrderedQty());
            spoLine.setUnitCost(cpoLine.getUnitCost()); // Note: In reality, Shopro might have a different buy/sell price
            spo.getLines().add(spoLine);
        }
        
        spo.setTotalValue(cpo.getTotalValue());
        PurchaseOrder savedSpo = poRepository.save(spo);
        
        // Link back
        cpo.setRelatedPoId(savedSpo.getId());
        
        // Create Platform Transaction (Ledger Entry)
        createPlatformTransaction(cpo, savedSpo);
        
        poRepository.save(cpo);
        return savedSpo;
    }

    private void createPlatformTransaction(PurchaseOrder cpo, PurchaseOrder spo) {
        PlatformTransaction tx = new PlatformTransaction();
        tx.setPoId(cpo.getId());
        tx.setTotalCapturedAmount(cpo.getTotalValue());
        
        // Assume 5% platform fee for now
        BigDecimal fee = cpo.getTotalValue().multiply(new BigDecimal("0.05"));
        tx.setFeeAmount(fee);
        tx.setSupplierPayoutAmount(cpo.getTotalValue().subtract(fee));
        tx.setStatus(PlatformTransaction.TransactionStatus.CAPTURED);
        
        transactionRepository.save(tx);
        
        cpo.setPlatformTxId(tx.getId());
        spo.setPlatformTxId(tx.getId());
    }
}
