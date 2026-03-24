package mls.sho.mplace.controller;

import mls.sho.mplace.util.SecurityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.dto.OrderAuditDto;
import mls.sho.mplace.dto.TraceabilityStatsDto;
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
    private final SecurityUtils securityUtils;
    private final mls.sho.mplace.service.MidMindService midMindService;

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

    @PostMapping("/{id}/auto-route")
    public ResponseEntity<Void> autoRouteOrder(@PathVariable UUID id) {
        midMindService.routePurchaseOrder(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/consolidate-invoices")
    public ResponseEntity<Void> consolidateInvoices(@PathVariable UUID id) {
        midMindService.consolidateInvoices(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/audit")
    public ResponseEntity<OrderAuditDto> getOrderAudit(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.getOrderAudit(id));
    }

    @GetMapping("/traceability/stats")
    public ResponseEntity<TraceabilityStatsDto> getTraceabilityStats() {
        return ResponseEntity.ok(orderService.getTraceabilityStats());
    }

    @GetMapping("/debug/whoami")
    public ResponseEntity<Map<String, Object>> debugWhoAmI() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        var requester = securityUtils.getCurrentRequester();
        
        Map<String, Object> debugInfo = new HashMap<>();
        debugInfo.put("principal", auth != null ? auth.getPrincipal() : "NULL");
        debugInfo.put("isAuthenticated", auth != null && auth.isAuthenticated());
        debugInfo.put("requester", requester);
        
        return ResponseEntity.ok(debugInfo);
    }
}
