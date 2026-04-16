package mls.sho.dms.application.purchasing.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.purchasing.repository.GoodsReceiptLineRepository;
import mls.sho.dms.application.purchasing.repository.GoodsReceiptRepository;
import mls.sho.dms.common.enums.GoodsReceiptStatus;
import mls.sho.dms.entity.GoodsReceipt;
import mls.sho.dms.entity.GoodsReceiptLine;
import mls.sho.dms.entity.Ingredient;
import mls.sho.dms.application.inventory.repository.IngredientRepository;
import mls.sho.dms.application.inventory.service.InventoryIntelligenceService;
import mls.sho.dms.application.purchasing.repository.PurchaseOrderRepository;
import mls.sho.dms.application.purchasing.service.PurchaseInvoiceService;
import mls.sho.dms.common.enums.PurchaseOrderStatus;
import mls.sho.dms.application.purchasing.dto.GoodsReceiptDTO;
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
    private final GoodsReceiptLineRepository goodsReceiptLineRepository;
    private final IngredientRepository ingredientRepository;
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
        if (grn.getLines() != null) {
            grn.getLines().forEach(line -> line.setGoodsReceipt(grn));
        }
        grn.calculateTotal();
        grn.setUpdatedAt(LocalDateTime.now());
        return goodsReceiptRepository.save(grn);
    }

    /**
     * Finalizes a GRN and updates inventory stock levels.
     */
    @Transactional
    public PurchaseInvoice finalise(Long grnId) {
        GoodsReceipt grn = getById(grnId);
        
        if (grn.getStatus() == GoodsReceiptStatus.RECEIVED) {
            throw new IllegalStateException("Goods Receipt is already finalized.");
        }

        // 1. Process Stock Increments
        if (grn.getLines() != null) {
            for (GoodsReceiptLine line : grn.getLines()) {
                Ingredient ing = line.getIngredient();
                if (ing != null) {
                    // Convert Received Purchase Units to Inventory Units
                    // e.g. 2 Bags * 50 (KG/Bag) = 100 KG added to onHand
                    BigDecimal conversionFactor = ing.getIuPerPu() != null ? ing.getIuPerPu() : BigDecimal.ONE;
                    BigDecimal increment = line.getReceivedQty().multiply(conversionFactor);
                    
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
                // Find matching GRN lines for this ingredient
                BigDecimal sumReceived = grn.getLines().stream()
                        .filter(gl -> gl.getIngredient().getId().equals(poLine.getIngredient().getId()))
                        .map(GoodsReceiptLine::getReceivedQty)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                poLine.setReceivedQty(poLine.getReceivedQty().add(sumReceived));
                
                if (poLine.getReceivedQty().compareTo(poLine.getOrderedQty()) < 0) {
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

    @Transactional(readOnly = true)
    public List<GoodsReceipt> getStaleGRNs(Long restaurantId) {
        return goodsReceiptRepository.findStaleGRNs(restaurantId);
    }

    @Transactional(readOnly = true)
    public List<GoodsReceipt> getConflicts(Long restaurantId) {
        return goodsReceiptRepository.findAllConflicts(restaurantId);
    }

    /**
     * Marks a specific GRN line as a conflict with a reason, and sets the GRN status to CONFLICT.
     */
    @Transactional
    public GoodsReceiptDTO raiseLineConflict(Long grnId, Long lineId, String reason) {
        GoodsReceipt grn = getById(grnId);
        GoodsReceiptLine line = goodsReceiptLineRepository.findById(lineId)
                .orElseThrow(() -> new RuntimeException("GRN line not found: " + lineId));
        if (!line.getGoodsReceipt().getId().equals(grnId)) {
            throw new RuntimeException("Line does not belong to this GRN");
        }
        line.setHasConflict(true);
        line.setConflictReason(reason);
        goodsReceiptLineRepository.save(line);
        grn.setStatus(GoodsReceiptStatus.CONFLICT);
        goodsReceiptRepository.save(grn);
        return toDTO(getById(grnId));
    }

    /**
     * Resolves a conflict line (clears flag) and moves GRN back to RECEIVED if no remaining conflicts.
     */
    @Transactional
    public GoodsReceiptDTO resolveLineConflict(Long grnId, Long lineId) {
        GoodsReceipt grn = getById(grnId);
        GoodsReceiptLine line = goodsReceiptLineRepository.findById(lineId)
                .orElseThrow(() -> new RuntimeException("GRN line not found: " + lineId));
        if (!line.getGoodsReceipt().getId().equals(grnId)) {
            throw new RuntimeException("Line does not belong to this GRN");
        }
        line.setHasConflict(false);
        line.setConflictReason(null);
        goodsReceiptLineRepository.save(line);

        boolean anyRemaining = grn.getLines().stream().anyMatch(GoodsReceiptLine::isHasConflict);
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
        
        if (grn.getLines() != null) {
            dto.setLines(grn.getLines().stream().map(line -> {
                GoodsReceiptDTO.GoodsReceiptLineDTO ldto = new GoodsReceiptDTO.GoodsReceiptLineDTO();
                ldto.setId(line.getId());
                ldto.setIngredientId(line.getIngredient().getId());
                ldto.setIngredientDescription(line.getIngredient().getDescription());
                ldto.setReceivedQty(line.getReceivedQty());
                ldto.setUnitPrice(line.getUnitPrice());
                ldto.setHasConflict(line.isHasConflict());
                ldto.setConflictReason(line.getConflictReason());
                return ldto;
            }).collect(Collectors.toList()));
        }
        return dto;
    }
}
