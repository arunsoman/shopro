package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.Category;
import mls.sho.mplace.entity.Food;
import mls.sho.mplace.repository.CategoryRepository;
import mls.sho.mplace.repository.FoodRepository;
import mls.sho.mplace.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import mls.sho.mplace.entity.MarkupRule;
import mls.sho.mplace.entity.Supplier;
import mls.sho.mplace.entity.SupplyList;
import mls.sho.mplace.repository.MarkupRuleRepository;
import mls.sho.mplace.repository.SupplierRepository;
import mls.sho.mplace.repository.SupplyListRepository;
import mls.sho.mplace.service.PricingService;
import mls.sho.mplace.dto.FoodOfferDto;

@RestController
@RequestMapping("/api/operator/catalog")
@RequiredArgsConstructor
public class OperatorCatalogController {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final FoodRepository foodRepository;
    private final MarkupRuleRepository markupRuleRepository;
    private final PricingService pricingService;
    private final SupplyListRepository supplyListRepository;
    private final SupplierRepository supplierRepository;

    @GetMapping("/foods")
    public Map<String, Object> getFoods(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false) String search) {
        
        Page<Food> foodPage;
        if (search != null && !search.trim().isEmpty()) {
            foodPage = foodRepository.findByNameContainingIgnoreCaseOrFoodGroupContainingIgnoreCase(
                search, search, PageRequest.of(page, size));
        } else {
            foodPage = foodRepository.findAll(PageRequest.of(page, size));
        }
        
        List<Map<String, Object>> content = foodPage.getContent().stream().map(f -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", f.getId() != null ? f.getId().toString() : "0");
            map.put("name", f.getName() != null ? f.getName() : "Unnamed Material");
            map.put("scientificName", f.getNameScientific() != null ? f.getNameScientific() : "");
            map.put("foodGroup", f.getFoodGroup() != null ? f.getFoodGroup() : "Other");
            map.put("foodSubgroup", f.getFoodSubgroup() != null ? f.getFoodSubgroup() : "");
            map.put("description", f.getDescription() != null ? f.getDescription() : "");
            return (Map<String, Object>) map;
        }).toList();

        Map<String, Object> response = new HashMap<>();
        response.put("content", content);
        response.put("totalElements", foodPage.getTotalElements());
        response.put("totalPages", foodPage.getTotalPages());
        response.put("currentPage", foodPage.getNumber());
        response.put("size", foodPage.getSize());
        
        return response;
    }

    @GetMapping("/foods/{foodId}/offers")
    public List<FoodOfferDto> getFoodOffers(@PathVariable Integer foodId) {
        return supplyListRepository.findAllByFoodId(foodId).stream()
            .map(offer -> {
                Supplier s = supplierRepository.findById(offer.getSupplierId()).orElse(null);
                return new FoodOfferDto(
                    offer.getSupplierId(),
                    s != null ? s.getName() : "Unknown",
                    s != null ? (double) s.getTrustScore() : 0.0,
                    s != null ? s.getFulfillmentRate().doubleValue() : 0.0,
                    offer.getPrice(),
                    offer.getStockQty()
                );
            }).toList();
    }

    @GetMapping("/foods/brief")
    public List<Map<String, String>> getFoodBriefs() {
        return foodRepository.findAll().stream().map(f -> {
            Map<String, String> map = new HashMap<>();
            map.put("id", f.getId() != null ? f.getId().toString() : "0");
            map.put("name", f.getName());
            return map;
        }).toList();
    }
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
    public List<MarkupRule> getPricingRules() {
        return markupRuleRepository.findAllActiveOrderedByPriority();
    }

    @PostMapping("/pricing-rules")
    public MarkupRule createPricingRule(@RequestBody MarkupRule rule) {
        return markupRuleRepository.save(rule);
    }

    @PutMapping("/pricing-rules/{id}")
    public MarkupRule updatePricingRule(@PathVariable UUID id, @RequestBody MarkupRule ruleUpdate) {
        return markupRuleRepository.findById(id).map(rule -> {
            rule.setName(ruleUpdate.getName());
            rule.setMarkupValue(ruleUpdate.getMarkupValue());
            rule.setMarkupType(ruleUpdate.getMarkupType());
            rule.setActive(ruleUpdate.isActive());
            return markupRuleRepository.save(rule);
        }).orElseThrow(() -> new RuntimeException("Rule not found"));
    }

    @DeleteMapping("/pricing-rules/{id}")
    public void deletePricingRule(@PathVariable UUID id) {
        // Prevent deletion of System Default (known UUID from V35)
        if (id.toString().equals("00000000-0000-4000-a000-000000000000")) {
            throw new RuntimeException("System Default rule cannot be deleted");
        }
        markupRuleRepository.deleteById(id);
    }

    @GetMapping("/super-groups")
    public List<String> getSuperGroups() {
        return foodRepository.findDistinctSuperGroups();
    }

    @GetMapping("/groups")
    public List<String> getGroups() {
        return foodRepository.findAll().stream()
            .map(Food::getFoodGroup)
            .filter(Objects::nonNull)
            .distinct()
            .toList();
    }

    @GetMapping("/subgroups")
    public List<String> getSubgroups(@RequestParam String group) {
        return foodRepository.findAll().stream()
            .filter(f -> group.equals(f.getFoodGroup()))
            .map(Food::getFoodSubgroup)
            .filter(Objects::nonNull)
            .distinct()
            .toList();
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
