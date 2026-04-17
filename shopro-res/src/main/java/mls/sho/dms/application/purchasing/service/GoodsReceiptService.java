package mls.sho.dms.application.purchasing.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.purchasing.repository.GoodsReceiptRepository;
import mls.sho.dms.common.enums.GoodsReceiptStatus;
import mls.sho.dms.entity.GoodsReceipt;
import mls.sho.dms.entity.PurchaseOrderLine;
import mls.sho.dms.entity.Ingredient;
import mls.sho.dms.application.inventory.repository.IngredientRepository;
import mls.sho.dms.application.inventory.service.InventoryIntelligenceService;
import mls.sho.dms.application.purchasing.repository.PurchaseOrderRepository;
import mls.sho.dms.application.purchasing.service.PurchaseInvoiceService;
import mls.sho.dms.common.enums.PurchaseOrderStatus;
import mls.sho.dms.application.purchasing.dto.GoodsReceiptDTO;
import mls.sho.dms.application.purchasing.dto.PurchaseOrderLineDTO;
import mls.sho.dms.application.purchasing.dto.ReceiveStockRequest;
import mls.sho.dms.application.purchasing.repository.SupplierRepository;
import mls.sho.dms.entity.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoodsReceiptService {

    private final GoodsReceiptRepository goodsReceiptRepository;
    private final IngredientRepository ingredientRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseInvoiceService purchaseInvoiceService;
    private final InventoryIntelligenceService inventoryIntelligenceService;

    @Transactional(readOnly = true)
    public List<GoodsReceipt> getAllByRestaurant(Long restaurantId) {
        return goodsReceiptRepository.findAllByRestaurantIdOrderByReceivedDateDesc(restaurantId);
    }

    @Transactional(readOnly = true)
    public GoodsReceipt getById(Long id) {
        return goodsReceiptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goods Receipt not found: " + id));
    }

    @Transactional
    public GoodsReceipt save(GoodsReceipt grn) {
        grn.calculateTotal();
        grn.setUpdatedAt(LocalDateTime.now());
        return goodsReceiptRepository.save(grn);
    }

    /**
     * Finalizes a GRN and updates inventory stock levels.
     * Uses lines from the linked PurchaseOrder.
     */
    @Transactional
    public PurchaseInvoice finalise(Long grnId) {
        GoodsReceipt grn = getById(grnId);
        
        if (grn.getStatus() == GoodsReceiptStatus.RECEIVED) {
            throw new IllegalStateException("Goods Receipt is already finalized.");
        }

        // 1. Process Stock Increments using PO lines
        List<PurchaseOrderLine> poLines = grn.getLines();
        if (poLines != null) {
            for (PurchaseOrderLine poLine : poLines) {
                Ingredient ing = poLine.getIngredient();
                if (ing != null && poLine.getReceivedQty() != null && poLine.getReceivedQty().compareTo(BigDecimal.ZERO) > 0) {
                    // Convert Received Purchase Units to Inventory Units
                    BigDecimal conversionFactor = ing.getIuPerPu() != null ? ing.getIuPerPu() : BigDecimal.ONE;
                    BigDecimal increment = poLine.getReceivedQty().multiply(conversionFactor);
                    
                    BigDecimal currentStock = ing.getOnHand() != null ? ing.getOnHand() : BigDecimal.ZERO;
                    ing.setOnHand(currentStock.add(increment));
                    ing.setUpdatedAt(LocalDateTime.now());
                    
                    ingredientRepository.save(ing);
                }
            }
            // Generate ledger and lot entries
            inventoryIntelligenceService.receiveShipment(grn);
        }

        // 2. Update PO status if linked
        PurchaseOrder po = grn.getPurchaseOrder();
        if (po != null) {
            boolean allLinesSatisfied = true;
            for (PurchaseOrderLine poLine : po.getLines()) {
                BigDecimal sumReceived = poLine.getReceivedQty() != null ? poLine.getReceivedQty() : BigDecimal.ZERO;
                
                if (sumReceived.compareTo(poLine.getOrderedQty()) < 0) {
                    allLinesSatisfied = false;
                }
            }
            po.setStatus(allLinesSatisfied ? PurchaseOrderStatus.RECEIVED : PurchaseOrderStatus.PARTIAL);
            purchaseOrderRepository.save(po);
        }

        // 3. Update GRN status
        grn.setStatus(GoodsReceiptStatus.RECEIVED);
        grn.setUpdatedAt(LocalDateTime.now());
        goodsReceiptRepository.save(grn);

        // 4. Auto-generate Invoice DRAFT
        return purchaseInvoiceService.createDraftFromGRN(grn.getId());
    }

    /**
     * Receive stock directly without a PO - creates PO, GRN, and invoice in one go.
     */
    @Transactional
    public PurchaseInvoice receiveStockDirectly(Long restaurantId, Long supplierId, List<ReceiveStockRequest.LineItem> lineItems) {
        // 1. Create a temporary PO
        PurchaseOrder po = new PurchaseOrder();
        Restaurant restaurant = new Restaurant();
        restaurant.setId(restaurantId);
        po.setRestaurant(restaurant);
        po.setSupplier(supplierRepository.findById(supplierId)
                .orElseThrow(() -> new RuntimeException("Supplier not found")));
        po.setIssueDate(LocalDateTime.now());
        po.setStatus(PurchaseOrderStatus.SENT);
        
        // Add lines
        for (ReceiveStockRequest.LineItem item : lineItems) {
            PurchaseOrderLine line = new PurchaseOrderLine();
            line.setPurchaseOrder(po);
            line.setIngredient(ingredientRepository.findById(item.getIngredientId())
                    .orElseThrow(() -> new RuntimeException("Ingredient not found: " + item.getIngredientId())));
            line.setOrderedQty(item.getReceivedQty()); // Use received as ordered for direct receipt
            line.setReceivedQty(item.getReceivedQty()); // Set received qty
            line.setUnitPrice(item.getUnitPrice());
            po.getLines().add(line);
        }
        po.calculateTotal();
        po = purchaseOrderRepository.save(po);
        
        // 2. Create GRN
        GoodsReceipt grn = new GoodsReceipt();
        grn.setRestaurant(restaurant);
        grn.setSupplier(po.getSupplier());
        grn.setPurchaseOrder(po);
        grn.setReceivedDate(LocalDateTime.now());
        grn.setStatus(GoodsReceiptStatus.RECEIVED);
        grn.calculateTotal();
        grn = goodsReceiptRepository.save(grn);
        
        // 3. Update inventory
        for (PurchaseOrderLine poLine : po.getLines()) {
            Ingredient ing = poLine.getIngredient();
            if (ing != null && poLine.getReceivedQty() != null && poLine.getReceivedQty().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal conversionFactor = ing.getIuPerPu() != null ? ing.getIuPerPu() : BigDecimal.ONE;
                BigDecimal increment = poLine.getReceivedQty().multiply(conversionFactor);
                BigDecimal currentStock = ing.getOnHand() != null ? ing.getOnHand() : BigDecimal.ZERO;
                ing.setOnHand(currentStock.add(increment));
                ing.setUpdatedAt(LocalDateTime.now());
                ingredientRepository.save(ing);
            }
        }
        
        // 4. Create Invoice Draft
        return purchaseInvoiceService.createDraftFromGRN(grn.getId());
    }

    @Transactional(readOnly = true)
    public List<GoodsReceipt> getStaleGRNs(Long restaurantId) {
        return goodsReceiptRepository.findStaleGRNs(restaurantId);
    }

    @Transactional(readOnly = true)
    public List<GoodsReceipt> getConflicts(Long restaurantId) {
        return goodsReceiptRepository.findAllConflicts(restaurantId);
    }

    /**
     * Marks a specific PO line as a conflict with a reason, and sets the GRN status to CONFLICT.
     */
    @Transactional
    public GoodsReceiptDTO raiseLineConflict(Long grnId, Long poLineId, String reason) {
        GoodsReceipt grn = getById(grnId);
        
        // Find the PO line
        PurchaseOrderLine poLine = grn.getLines().stream()
                .filter(l -> l.getId().equals(poLineId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("PO line not found: " + poLineId));
        
        poLine.setHasConflict(true);
        poLine.setConflictReason(reason);
        
        grn.setStatus(GoodsReceiptStatus.CONFLICT);
        goodsReceiptRepository.save(grn);
        
        return toDTO(getById(grnId));
    }

    /**
     * Resolves a conflict line (clears flag) and moves GRN back to RECEIVED if no remaining conflicts.
     */
    @Transactional
    public GoodsReceiptDTO resolveLineConflict(Long grnId, Long poLineId) {
        GoodsReceipt grn = getById(grnId);
        
        // Find and clear the PO line
        PurchaseOrderLine poLine = grn.getLines().stream()
                .filter(l -> l.getId().equals(poLineId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("PO line not found: " + poLineId));
        
        poLine.setHasConflict(false);
        poLine.setConflictReason(null);

        boolean anyRemaining = grn.getLines().stream().anyMatch(PurchaseOrderLine::isHasConflict);
        if (!anyRemaining) {
            grn.setStatus(GoodsReceiptStatus.RECEIVED);
            goodsReceiptRepository.save(grn);
        }
        return toDTO(getById(grnId));
    }

    public GoodsReceiptDTO toDTO(GoodsReceipt grn) {
        GoodsReceiptDTO dto = new GoodsReceiptDTO();
        dto.setId(grn.getId());
        dto.setSupplierId(grn.getSupplier().getId());
        dto.setSupplierName(grn.getSupplier().getName());
        dto.setPurchaseOrderId(grn.getPurchaseOrder() != null ? grn.getPurchaseOrder().getId() : null);
        dto.setPoNumber(grn.getPurchaseOrder() != null ? grn.getPurchaseOrder().getId().toString() : null);
        dto.setReceivedDate(grn.getReceivedDate());
        dto.setTotalAmount(grn.getTotalAmount());
        dto.setStatus(grn.getStatus());
        dto.setNotes(grn.getNotes());
        
        dto.setLines(grn.getLines().stream().map(line -> {
            PurchaseOrderLineDTO ldto = new PurchaseOrderLineDTO();
            ldto.setId(line.getId());
            ldto.setIngredientId(line.getIngredient().getId());
            ldto.setIngredientDescription(line.getIngredient().getDescription());
            ldto.setReceivedQty(line.getReceivedQty());
            ldto.setUnitPrice(line.getUnitPrice());
            // Calculate lineTotal = receivedQty * unitPrice
            if (line.getReceivedQty() != null && line.getUnitPrice() != null) {
                ldto.setLineTotal(line.getReceivedQty().multiply(line.getUnitPrice()));
            }
            return ldto;
        }).collect(Collectors.toList()));
        
        return dto;
    }
}
