package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.dto.ProductMasterDto;
import mls.sho.mplace.entity.Product;
import mls.sho.mplace.repository.ProductRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/operator/products")
@RequiredArgsConstructor
public class OperatorProductController {

    private final ProductRepository productRepository;

    @GetMapping
    public List<ProductMasterDto> getProducts() {
        return productRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    private ProductMasterDto mapToDto(Product p) {
        return new ProductMasterDto(
                p.getId(),
                p.getName(),
                p.getSku(),
                p.getCategory() != null ? p.getCategory().getName() : "General",
                1, // Simplified for now, in real app would be count of unique suppliers for this master SKU
                p.getBasePrice(),
                p.getStockStatus().name().toLowerCase(),
                p.getStockQuantity(),
                p.getImageUrl()
        );
    }
}
