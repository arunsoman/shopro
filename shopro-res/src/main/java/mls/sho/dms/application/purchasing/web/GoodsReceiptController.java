package mls.sho.dms.application.purchasing.web;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.purchasing.service.GoodsReceiptService;
import mls.sho.dms.entity.GoodsReceipt;
import mls.sho.dms.entity.Restaurant;
import mls.sho.dms.entity.PurchaseInvoice;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import mls.sho.dms.application.purchasing.dto.GoodsReceiptDTO;
import mls.sho.dms.application.purchasing.dto.PurchaseInvoiceDTO;
import mls.sho.dms.application.purchasing.service.PurchaseInvoiceService;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/purchasing/grns")
@RequiredArgsConstructor
public class GoodsReceiptController {

    private final GoodsReceiptService goodsReceiptService;
    private final PurchaseInvoiceService purchaseInvoiceService;

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
    public GoodsReceiptDTO create(@PathVariable Long restaurantId, @RequestBody GoodsReceipt grn) {
        Restaurant restaurant = new Restaurant();
        restaurant.setId(restaurantId);
        grn.setRestaurant(restaurant);
        return goodsReceiptService.toDTO(goodsReceiptService.save(grn));
    }

    @PostMapping("/{id}/finalise")
    public PurchaseInvoiceDTO finalise(@PathVariable Long restaurantId, @PathVariable Long id) {
        PurchaseInvoice invoice = goodsReceiptService.finalise(id);
        return purchaseInvoiceService.toDTO(invoice);
    }

    @GetMapping("/stale")
    public List<GoodsReceiptDTO> getStale(@PathVariable Long restaurantId,
                                          @RequestParam(defaultValue = "3") int days) {
        return goodsReceiptService.getStaleGRNs(restaurantId, days).stream()
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
