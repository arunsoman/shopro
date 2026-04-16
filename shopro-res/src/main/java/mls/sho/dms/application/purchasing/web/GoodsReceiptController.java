package mls.sho.dms.application.purchasing.web;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.purchasing.dto.GoodsReceiptDTO;
import mls.sho.dms.application.purchasing.dto.PurchaseInvoiceDTO;
import mls.sho.dms.application.purchasing.repository.SupplierRepository;
import mls.sho.dms.application.purchasing.service.GoodsReceiptService;
import mls.sho.dms.application.purchasing.service.PurchaseInvoiceService;
import mls.sho.dms.entity.GoodsReceipt;
import mls.sho.dms.entity.PurchaseInvoice;
import mls.sho.dms.entity.PurchaseOrder;
import mls.sho.dms.entity.Restaurant;
import mls.sho.dms.entity.Supplier;
import mls.sho.dms.application.purchasing.repository.PurchaseOrderRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/purchasing/grns")
@RequiredArgsConstructor
public class GoodsReceiptController {

    private final GoodsReceiptService goodsReceiptService;
    private final PurchaseInvoiceService purchaseInvoiceService;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    @GetMapping
    public List<GoodsReceiptDTO> getAll(@PathVariable Long restaurantId) {
        return goodsReceiptService.getAllByRestaurant(restaurantId).stream()
                .map(goodsReceiptService::toDTO)
                .toList();
    }

    @GetMapping("/{id}")
    public GoodsReceiptDTO getById(@PathVariable Long restaurantId, @PathVariable Long id) {
        return goodsReceiptService.toDTO(goodsReceiptService.getById(id));
    }

    @PostMapping
    public GoodsReceiptDTO create(@PathVariable Long restaurantId, @RequestBody GoodsReceiptDTO dto) {
        // Convert DTO to Entity - manually map IDs to entities
        GoodsReceipt grn = new GoodsReceipt();
        
        // Map supplier
        if (dto.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found: " + dto.getSupplierId()));
            grn.setSupplier(supplier);
        } else {
            throw new RuntimeException("supplierId is required");
        }
        
        // Map purchase order if provided
        if (dto.getPurchaseOrderId() != null) {
            PurchaseOrder po = purchaseOrderRepository.findById(dto.getPurchaseOrderId()).orElse(null);
            grn.setPurchaseOrder(po);
        }
        
        // Set restaurant
        Restaurant restaurant = new Restaurant();
        restaurant.setId(restaurantId);
        grn.setRestaurant(restaurant);
        
        // Map other fields
        grn.setReceivedDate(dto.getReceivedDate());
        grn.setNotes(dto.getNotes());
        
        return goodsReceiptService.toDTO(goodsReceiptService.save(grn));
    }

    @PostMapping("/{id}/finalise")
    public PurchaseInvoiceDTO finalise(@PathVariable Long restaurantId, @PathVariable Long id) {
        PurchaseInvoice invoice = goodsReceiptService.finalise(id);
        return purchaseInvoiceService.toDTO(invoice);
    }

    @GetMapping("/stale")
    public List<GoodsReceiptDTO> getStale(@PathVariable Long restaurantId) {
        return goodsReceiptService.getStaleGRNs(restaurantId).stream()
                .map(goodsReceiptService::toDTO)
                .toList();
    }

    @GetMapping("/conflicts")
    public List<GoodsReceiptDTO> getConflicts(@PathVariable Long restaurantId) {
        return goodsReceiptService.getConflicts(restaurantId).stream()
                .map(goodsReceiptService::toDTO)
                .toList();
    }

    @PostMapping("/{grnId}/lines/{lineId}/conflict")
    public GoodsReceiptDTO raiseConflict(
            @PathVariable Long restaurantId,
            @PathVariable Long grnId,
            @PathVariable Long lineId,
            @RequestBody Map<String, String> body) {
        return goodsReceiptService.raiseLineConflict(grnId, lineId, body.get("reason"));
    }

    @PostMapping("/{grnId}/lines/{lineId}/resolve")
    public GoodsReceiptDTO resolveConflict(
            @PathVariable Long restaurantId,
            @PathVariable Long grnId,
            @PathVariable Long lineId) {
        return goodsReceiptService.resolveLineConflict(grnId, lineId);
    }
}
