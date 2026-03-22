package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.MarketplaceSupplier;
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

    public record SupplierProductDTO(String id, String name, String category, double price, int stock, String status) {}

    @GetMapping("/products")
    public List<SupplierProductDTO> getProducts(@AuthenticationPrincipal MarketplaceSupplier supplier) {
        return catalogService.getProductsBySupplier(supplier.getSupplierId()).stream()
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
    public Map<String, Object> getStats(@AuthenticationPrincipal MarketplaceSupplier supplier) {
        List<mls.sho.mplace.entity.Product> products = catalogService.getProductsBySupplier(supplier.getSupplierId());
        return Map.of(
            "totalSKUs", products.size(),
            "activeListings", products.size(),
            "outOfStock", 0,
            "lowStock", 0
        );
    }
}
