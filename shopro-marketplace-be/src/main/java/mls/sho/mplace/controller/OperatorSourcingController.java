package mls.sho.mplace.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/operator/sourcing")
public class OperatorSourcingController {

    @GetMapping("/po-inbox")
    public List<Map<String, Object>> getPOInbox() {
        return List.of(
            Map.of("id", "PO-7721", "restaurant", "Mama's Italian", "amount", 1450.00, "items", 12, "status", "Pending Review", "priority", "High"),
            Map.of("id", "PO-7725", "restaurant", "Zen Sushi", "amount", 890.50, "items", 8, "status", "Unassigned", "priority", "Medium")
        );
    }

    @GetMapping("/po-review/{id}")
    public Map<String, Object> getPOReview(@PathVariable String id) {
        return Map.of(
            "id", id,
            "restaurant", "Mama's Italian",
            "items", List.of(
                Map.of("sku", "SKU-001", "name", "Premium Flour", "qty", 50, "price", 2.50),
                Map.of("sku", "SKU-002", "name", "Olive Oil", "qty", 10, "price", 15.00)
            ),
            "total", 275.00,
            "status", "Reviewing"
        );
    }

    @GetMapping("/sub-pos")
    public List<Map<String, Object>> getSubPOs() {
        return List.of(
            Map.of("id", "SUB-9901-A", "parentPO", "PO-7721", "supplier", "Global Foods", "status", "Dispatched", "amount", 450.20),
            Map.of("id", "SUB-9901-B", "parentPO", "PO-7721", "supplier", "Fresh Veggies", "status", "Preparing", "amount", 120.50)
        );
    }

    @GetMapping("/sourcing-wizard/stats")
    public Map<String, Object> getSourcingStats() {
        return Map.of(
            "unassignedItems", 45,
            "optimalSuppliers", 12,
            "avgSavings", "14.2%"
        );
    }

    @GetMapping("/po-outbox")
    public List<Map<String, Object>> getPOOutbox() {
        return List.of(
            Map.of("id", "PO-OUT-001", "destination", "Supplier X", "status", "Confirmed", "sentAt", "Mar 20, 10:00"),
            Map.of("id", "PO-OUT-002", "destination", "Supplier Y", "status", "Failed", "sentAt", "Mar 20, 11:30")
        );
    }
}
