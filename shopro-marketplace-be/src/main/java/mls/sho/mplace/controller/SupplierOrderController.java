package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.MarketplaceSupplier;
import mls.sho.mplace.entity.SubOrder;
import mls.sho.mplace.service.SupplierOrderService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Supplier Order Controller
 * Scoped to /api/supplier/**
 */
@RestController
@RequestMapping("/api/supplier/orders")
@RequiredArgsConstructor
public class SupplierOrderController {

    private final SupplierOrderService supplierOrderService;

    public record SupplierOrderItem(String id, String product, double quantity, double price) {}
    public record SubOrderDTO(String id, String buyer, String date, double amount, String status, List<SupplierOrderItem> items) {}

    @GetMapping
    public List<SubOrderDTO> getOrders(@AuthenticationPrincipal MarketplaceSupplier supplier) {
        return supplierOrderService.getOrdersForSupplier(supplier).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @PatchMapping("/{id}/status")
    public String updateStatus(@PathVariable java.util.UUID id, @RequestParam String status, @AuthenticationPrincipal MarketplaceSupplier supplier) {
        SubOrder.SubOrderStatus newStatus = "PENDING_ACK".equals(status) ? SubOrder.SubOrderStatus.ACK_PENDING : SubOrder.SubOrderStatus.valueOf(status);
        supplierOrderService.updateStatus(id, newStatus, supplier);
        return "STATUS_UPDATED_TO_" + status + ".X";
    }

    private SubOrderDTO toDTO(SubOrder sub) {
        return new SubOrderDTO(
                "SO-" + sub.getId().toString().substring(0, 8).toUpperCase(),
                "REST-" + sub.getPurchaseOrder().getRestaurantId().toString().substring(0, 8).toUpperCase(),
                sub.getCreatedAt() != null ? sub.getCreatedAt().toString() : "2024-03-21",
                sub.getTotalAmount() != null ? sub.getTotalAmount().doubleValue() : 0.0,
                sub.getStatus() == SubOrder.SubOrderStatus.ACK_PENDING ? "PENDING_ACK" : sub.getStatus().name(),
                sub.getItems().stream()
                        .map(i -> new SupplierOrderItem(i.getId().toString(), i.getProduct().getName(), i.getQuantity() != null ? i.getQuantity().doubleValue() : 0.0, i.getPrice() != null ? i.getPrice().doubleValue() : 0.0))
                        .collect(Collectors.toList())
        );
    }
}
