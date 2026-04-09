package mls.sho.dms.application.purchasing.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.purchasing.dto.PurchaseOrderCreateDTO;
import mls.sho.dms.application.purchasing.dto.PurchaseOrderDTO;
import mls.sho.dms.application.purchasing.dto.PurchaseMatchBundleDTO;
import mls.sho.dms.application.purchasing.service.PurchaseOrderService;
import mls.sho.dms.common.enums.PurchaseOrderStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for Purchase Order operations.
 * Scope: Restaurant level.
 */
@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService poService;

    @GetMapping
    public ResponseEntity<List<PurchaseOrderDTO>> listOrders(
            @PathVariable Long restaurantId,
            @RequestParam(required = false) PurchaseOrderStatus status) {
        return ResponseEntity.ok(poService.listOrders(restaurantId, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderDTO> getOrder(
            @PathVariable Long restaurantId,
            @PathVariable Long id) {
        return ResponseEntity.ok(poService.getOrder(restaurantId, id));
    }

    @PostMapping
    public ResponseEntity<PurchaseOrderDTO> createOrder(
            @PathVariable Long restaurantId,
            @RequestBody PurchaseOrderCreateDTO dto) {
        return ResponseEntity.ok(poService.createOrder(restaurantId, dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PurchaseOrderDTO> updateStatus(
            @PathVariable Long restaurantId,
            @PathVariable Long id,
            @RequestParam PurchaseOrderStatus status) {
        return ResponseEntity.ok(poService.updateStatus(restaurantId, id, status));
    }

    @GetMapping("/{id}/match-bundle")
    public ResponseEntity<PurchaseMatchBundleDTO> getMatchBundle(
            @PathVariable Long restaurantId,
            @PathVariable Long id) {
        return ResponseEntity.ok(poService.getMatchBundle(restaurantId, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(
            @PathVariable Long restaurantId,
            @PathVariable Long id) {
        poService.deleteOrder(restaurantId, id);
        return ResponseEntity.noContent().build();
    }
}
