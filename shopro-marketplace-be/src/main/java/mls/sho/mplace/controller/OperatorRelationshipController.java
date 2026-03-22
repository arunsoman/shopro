package mls.sho.mplace.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/operator/relationships")
public class OperatorRelationshipController {

    @GetMapping("/suppliers")
    public List<Map<String, Object>> getSuppliers() {
        return List.of(
            Map.of("id", "SUP-101", "name", "Global Foods", "category", "Fruits & Veggies", "rating", 4.8, "status", "Verified"),
            Map.of("id", "SUP-102", "name", "Ocean's Best", "category", "Seafood", "rating", 4.5, "status", "Onboarding")
        );
    }

    @GetMapping("/suppliers/vetting")
    public List<Map<String, Object>> getSupplierVetting() {
        return List.of(
            Map.of("id", "VET-001", "name", "Local Dairy Co", "step", "Document Check", "priority", "High"),
            Map.of("id", "VET-002", "name", "Organic Spices", "step", "Site Visit", "priority", "Medium")
        );
    }

    @GetMapping("/suppliers/{id}")
    public Map<String, Object> getSupplierDetail(@PathVariable String id) {
        return Map.of(
            "id", id,
            "name", "Global Foods",
            "fullAddress", "123 Supply Ave, Mumbai",
            "contact", "admin@globalfoods.com",
            "performance", Map.of("fulfillment", "98%", "accuracy", "99%")
        );
    }

    @GetMapping("/restaurants")
    public List<Map<String, Object>> getRestaurants() {
        return List.of(
            Map.of("id", "RES-501", "name", "Mama's Italian", "location", "Bandra", "ordersMonth", 45, "status", "Active"),
            Map.of("id", "RES-502", "name", "Zen Sushi", "location", "Colaba", "ordersMonth", 12, "status", "Onboarding")
        );
    }

    @GetMapping("/users")
    public List<Map<String, Object>> getUsers() {
        return List.of(
            Map.of("id", "USR-001", "name", "Amit Shah", "role", "Buyer Admin", "lastLogin", "Mar 20, 14:00"),
            Map.of("id", "USR-002", "name", "Sriya Rao", "role", "Supplier Staff", "lastLogin", "Mar 19, 10:30")
        );
    }
}
