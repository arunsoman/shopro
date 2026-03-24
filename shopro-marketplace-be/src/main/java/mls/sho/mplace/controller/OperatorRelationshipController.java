package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.Supplier;
import mls.sho.mplace.repository.MarketplaceBuyerRepository;
import mls.sho.mplace.repository.MarketplaceSupplierRepository;
import mls.sho.mplace.repository.RestaurantRepository;
import mls.sho.mplace.repository.SupplierRepository;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/operator/relationships")
@RequiredArgsConstructor
public class OperatorRelationshipController {

    private final SupplierRepository supplierRepository;
    private final RestaurantRepository restaurantRepository;
    private final MarketplaceBuyerRepository buyerRepository;
    private final MarketplaceSupplierRepository marketplaceSupplierRepository;

    @GetMapping("/suppliers")
    public List<Map<String, Object>> getSuppliers() {
        return supplierRepository.findAll().stream()
                .map(s -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", s.getId().toString());
                    map.put("name", s.getName());
                    map.put("category", s.getCategory() != null ? s.getCategory() : "OTHERS");
                    map.put("rating", s.getRating());
                    map.put("status", s.getVerificationStatus() != null ? s.getVerificationStatus().name() : "PENDING");
                    return map;
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/suppliers/vetting")
    public List<Map<String, Object>> getSupplierVetting() {
        return List.of(
            Map.of("id", "VET-001", "name", "Local Dairy Co", "step", "Document Check", "priority", "High"),
            Map.of("id", "VET-002", "name", "Organic Spices", "step", "Site Visit", "priority", "Medium")
        );
    }

    @GetMapping("/suppliers/{id}")
    public Map<String, Object> getSupplierDetail(@PathVariable UUID id) {
        Supplier s = supplierRepository.findById(id).orElseThrow();
        Map<String, Object> map = new HashMap<>();
        map.put("id", s.getId().toString());
        map.put("name", s.getName());
        map.put("fullAddress", s.getBusinessDetails()); // Use details as address mock
        map.put("contact", "admin@" + s.getName().toLowerCase().replace(" ", "") + ".com");
        map.put("performance", Map.of(
            "fulfillment", (s.getFulfillmentRate() != null ? s.getFulfillmentRate() : 0) + "%",
            "accuracy", "99%"
        ));
        return map;
    }

    @GetMapping("/restaurants")
    public List<Map<String, Object>> getRestaurants() {
        return restaurantRepository.findAll().stream()
                .map(r -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", r.getId().toString());
                    map.put("name", r.getName());
                    map.put("location", r.getAddress() != null ? r.getAddress() : "Mumbai");
                    map.put("ordersMonth", (int)(Math.random() * 50)); // Mock order count
                    map.put("status", r.getVerificationStatus() != null ? r.getVerificationStatus() : "ACTIVE");
                    return map;
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/users")
    public List<Map<String, Object>> getUsers() {
        List<Map<String, Object>> buyers = buyerRepository.findAll().stream()
                .map(u -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", u.getId().toString());
                    map.put("name", u.getFullName());
                    map.put("role", "BUYER");
                    map.put("lastLogin", "Mar 23, 16:00");
                    return map;
                }).toList();

        List<Map<String, Object>> suppliers = marketplaceSupplierRepository.findAll().stream()
                .map(u -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", u.getId().toString());
                    map.put("name", u.getFullName());
                    map.put("role", "SUPPLIER");
                    map.put("lastLogin", "Mar 23, 16:00");
                    return map;
                }).toList();

        return Stream.concat(buyers.stream(), suppliers.stream()).toList();
    }
}
