package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.config.MarketplaceUser;
import mls.sho.mplace.service.CatalogService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Buyer (Restaurant) Catalog Controller
 * Scoped to /api/buyer/**
 */
@RestController
@RequestMapping("/api/buyer/catalog")
@RequiredArgsConstructor
public class BuyerCatalogController {

    private final CatalogService catalogService;

    public record CategoryRecord(String id, String name, String icon) {}
    public record ProductRecord(String id, String name, String category, String supplier, double price, String unit, String status, String image) {}
    public record CreateCategoryRequest(String name, String icon) {}

    @GetMapping("/categories")
    public List<CategoryRecord> getCategories(@AuthenticationPrincipal MarketplaceUser user) {
        return catalogService.getAllCategories(user.getRestaurantId()).stream()
                .map(c -> new CategoryRecord(c.getId().toString(), c.getName(), c.getIcon()))
                .collect(Collectors.toList());
    }

    @PostMapping("/categories")
    public CategoryRecord createCategory(
            @AuthenticationPrincipal MarketplaceUser user,
            @RequestBody CreateCategoryRequest request
    ) {
        var category = catalogService.createCategory(
                request.name(),
                request.icon(),
                user.getRestaurantId(),
                user.getId()
        );
        return new CategoryRecord(category.getId().toString(), category.getName(), category.getIcon());
    }

    @GetMapping("/products")
    public List<ProductRecord> getProducts(
            @AuthenticationPrincipal MarketplaceUser user,
            @RequestParam(required = false) String categoryId
    ) {
        List<mls.sho.mplace.entity.Product> products;
        if (categoryId != null && !categoryId.isEmpty()) {
            products = catalogService.getProductsByCategory(UUID.fromString(categoryId), user.getRestaurantId());
        } else {
            products = catalogService.getAllProducts(user.getRestaurantId());
        }

        return products.stream()
                .map(p -> new ProductRecord(
                        p.getId().toString(),
                        p.getName(),
                        p.getCategory().getName(),
                        p.getSupplier().getName(),
                        p.getBasePrice().doubleValue(),
                        p.getUnit(),
                        "IN_STOCK",
                        "product_placeholder.png"
                )).collect(Collectors.toList());
    }
}
