package mls.sho.dms.web.controller.inventory;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.dto.inventory.CreatePurchaseOrderRequest;
import mls.sho.dms.application.dto.inventory.PurchaseOrderResponse;
import mls.sho.dms.application.dto.inventory.POStatusHistoryResponse;
import mls.sho.dms.application.service.inventory.POService;
import mls.sho.dms.entity.inventory.procurement.PurchaseOrder;
import mls.sho.dms.repository.staff.StaffRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/inventory/purchase-orders")
@RequiredArgsConstructor
@Tag(name = "Purchase Orders", description = "Procurement management")
public class PurchaseOrderController {

    private final POService poService;
    private final StaffRepository staffRepository;

    @GetMapping
    public List<PurchaseOrderResponse> findAll() {
        return poService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PurchaseOrderResponse create(@Valid @RequestBody CreatePurchaseOrderRequest request, Principal principal) {
        try {
            UUID generatedById = resolveStaffId(principal);
            return mapToResponse(poService.createOrder(request, generatedById));
        } catch (Exception e) {
            log.error("Failed to create manual Purchase Order", e);
            throw e;
        }
    }

    @PostMapping("/{id}/cancel")
    public void cancel(@PathVariable UUID id) {
        poService.cancelOrder(id);
    }

    @PostMapping("/{id}/approve")
    public PurchaseOrderResponse approve(@PathVariable UUID id, Principal principal) {
        UUID approverId = resolveStaffId(principal);
        return mapToResponse(poService.approveOrder(id, approverId));
    }

    @PostMapping("/{id}/reject")
    public PurchaseOrderResponse reject(@PathVariable UUID id, @RequestParam String reason, Principal principal) {
        UUID approverId = resolveStaffId(principal);
        return mapToResponse(poService.rejectOrder(id, approverId, reason));
    }

    @GetMapping("/{id}/history")
    public List<POStatusHistoryResponse> getHistory(@PathVariable UUID id) {
        return poService.getStatusHistory(id);
    }

    private UUID resolveStaffId(Principal principal) {
        if (principal != null) {
            return staffRepository.findByFullName(principal.getName())
                .map(s -> s.getId())
                .orElseGet(this::getFallbackStaffId);
        }
        return getFallbackStaffId();
    }

    private UUID getFallbackStaffId() {
        return staffRepository.findByActiveTrue().stream()
            .findFirst()
            .map(s -> s.getId())
            .orElseThrow(() -> new IllegalStateException("No active staff members found in the system. Reorder requires a valid creator."));
    }

    private PurchaseOrderResponse mapToResponse(PurchaseOrder po) {
        return PurchaseOrderResponse.builder()
                .id(po.getId())
                .supplierName(po.getSupplier() != null ? po.getSupplier().getCompanyName() : "Pending Award")
                .status(po.getStatus())
                .totalValue(po.getTotalValue())
                .expectedDeliveryDate(po.getExpectedDeliveryDate())
                .acknowledgedAt(po.getAcknowledgedAt())
                .shippedAt(po.getShippedAt())
                .counterOfferPrice(po.getCounterOfferPrice())
                .counterOfferQty(po.getCounterOfferQty())
                .counterOfferNotes(po.getCounterOfferNotes())
                .trackingNumber(po.getTrackingNumber())
                .deliveryNoteRef(po.getDeliveryNoteRef())
                .createdAt(po.getCreatedAt())
                .items(po.getLines().stream()
                        .map(line -> PurchaseOrderResponse.PurchaseOrderLineResponse.builder()
                                .id(line.getId())
                                .ingredientId(line.getIngredient().getId())
                                .ingredientName(line.getIngredient().getName())
                                .orderedQty(line.getOrderedQty())
                                .unitCost(line.getUnitCost())
                                .unitOfMeasure(line.getIngredient().getUnitOfMeasure())
                                .build())
                        .collect(java.util.stream.Collectors.toList()))
                .build();
    }
}
