package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.dto.PurchaseOrderDto;
import mls.sho.mplace.dto.SplitItemRequest;
import mls.sho.mplace.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/operator/orders")
@RequiredArgsConstructor
public class OperatorOrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<PurchaseOrderDto>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderDto> getOrderById(@PathVariable UUID id) {
        PurchaseOrderDto order = orderService.getOrderById(id);
        if (order == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{id}/split")
    public ResponseEntity<Void> splitOrder(@PathVariable UUID id, @RequestBody List<SplitItemRequest> splits) {
        orderService.splitOrder(id, splits);
        return ResponseEntity.ok().build();
    }
}
