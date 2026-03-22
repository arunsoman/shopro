package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.Category;
import mls.sho.mplace.repository.CategoryRepository;
import mls.sho.mplace.repository.ProductRepository;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/operator/catalog")
@RequiredArgsConstructor
public class OperatorCatalogController {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @GetMapping("/products")
    public List<Map<String, Object>> getProducts() {
        return productRepository.findAll().stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId().toString());
            map.put("name", p.getName());
            map.put("sku", p.getSku());
            map.put("price", p.getBasePrice());
            map.put("stock", p.getStockQuantity());
            map.put("category", p.getCategory() != null ? p.getCategory().getName() : "Uncategorized");
            map.put("status", p.isEnabled() ? "Active" : "Inactive");
            return map;
        }).toList();
    }

    @GetMapping("/categories")
    public List<Map<String, Object>> getCategories() {
        return categoryRepository.findAll().stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId().toString());
            map.put("name", c.getName());
            map.put("productCount", productRepository.countByCategory_Id(c.getId()));
            map.put("status", "Active");
            return map;
        }).toList();
    }

    @PostMapping("/categories")
    public Map<String, Object> createCategory(@RequestBody Map<String, String> request) {
        Category category = new Category();
        category.setName(request.get("name"));
        category.setIcon(request.get("icon"));
        Category saved = categoryRepository.save(category);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", saved.getId().toString());
        response.put("name", saved.getName());
        response.put("productCount", 0);
        response.put("status", "Active");
        return response;
    }

    @GetMapping("/pricing-rules")
    public List<Map<String, Object>> getPricingRules() {
        return List.of(
            Map.of("id", "RULE-PR-101", "name", "Volume Discount: Organic Produce", "type", "Volume Based", "discount", "7%", "status", "Active"),
            Map.of("id", "RULE-PR-102", "name", "Regional Surge: North-East", "type", "Surcharge", "adjustment", "+4%", "status", "Active"),
            Map.of("id", "RULE-PR-103", "name", "Flash Sale: Dairy V3", "type", "Promotional", "discount", "15%", "status", "Active")
        );
    }

    @GetMapping("/optimization-stats")
    public Map<String, Object> getOptimizationStats() {
        return Map.of(
            "avgMargin", 21.2,
            "marginLeakage", 1.8,
            "priceCompetitiveness", 94,
            "activePromotions", 18,
            "topCategory", "Produce",
            "riskNodes", 2
        );
    }
}
