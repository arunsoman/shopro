package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.config.MarketplaceUser;
import mls.sho.mplace.service.CatalogService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Supplier Catalog Controller
 * Scoped to /api/supplier/**
 */
@RestController
@RequestMapping("/api/supplier/catalog")
@RequiredArgsConstructor
public class SupplierCatalogController {

    private final CatalogService catalogService;
    private final mls.sho.mplace.repository.FoodRepository foodRepository;

    @GetMapping("/foods")
    public List<mls.sho.mplace.entity.Food> getFoods(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        if (search != null && !search.trim().isEmpty()) {
            return foodRepository.findByNameContainingIgnoreCaseOrFoodGroupContainingIgnoreCase(search, search, pageable).getContent();
        }
        return foodRepository.findAll(pageable).getContent();
    }

    public record SupplierProductDTO(String id, String name, String category, double price, int stock, String status) {}

    @GetMapping("/products")
    public List<SupplierProductDTO> getProducts(@AuthenticationPrincipal MarketplaceUser user) {
        return catalogService.getProductsBySupplier(user.getSupplierId()).stream()
                .map(p -> new SupplierProductDTO(
                        p.getId().toString(),
                        p.getName(),
                        p.getCategory().getName(),
                        p.getBasePrice().doubleValue(),
                        100, // Mock stock for now
                        "IN_STOCK"
                )).collect(Collectors.toList());
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats(@AuthenticationPrincipal MarketplaceUser user) {
        List<mls.sho.mplace.entity.Product> products = catalogService.getProductsBySupplier(user.getSupplierId());
        return Map.of(
            "totalSKUs", products.size(),
            "activeListings", products.size(),
            "outOfStock", 0,
            "lowStock", 0
        );
    }
}
