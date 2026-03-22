package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.Category;
import mls.sho.mplace.entity.Product;
import mls.sho.mplace.entity.Supplier;
import mls.sho.mplace.entity.RestaurantInventory;
import mls.sho.mplace.repository.CategoryRepository;
import mls.sho.mplace.repository.ProductRepository;
import mls.sho.mplace.repository.RestaurantInventoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CatalogService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final RestaurantInventoryRepository inventoryRepository;

    public List<Category> getAllCategories(UUID restaurantId) {
        if (restaurantId == null) {
            return categoryRepository.findAll();
        }
        return categoryRepository.findByRestaurantIdOrRestaurantIdIsNull(restaurantId);
    }

    public Category createCategory(String name, String icon, UUID restaurantId, UUID userId) {
        Category category = new Category();
        category.setName(name);
        category.setIcon(icon);
        category.setRestaurantId(restaurantId);
        category.setCreatedById(userId);
        return categoryRepository.save(category);
    }

    @Transactional(readOnly = true)
    public List<Product> getAllProducts(UUID restaurantId) {
        if (restaurantId == null) {
            return productRepository.findAll();
        }
        return inventoryRepository.findAllByRestaurantId(restaurantId).stream()
                .map(RestaurantInventory::getProduct)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Product> getProductsByCategory(UUID categoryId, UUID restaurantId) {
        if (restaurantId == null) {
            return productRepository.findAllByCategory_Id(categoryId);
        }
        return inventoryRepository.findAllByRestaurantId(restaurantId).stream()
                .map(RestaurantInventory::getProduct)
                .filter(p -> p.getCategory().getId().equals(categoryId))
                .toList();
    }

    public List<Product> getProductsBySupplier(UUID supplierId) {
        return productRepository.findAllBySupplier_Id(supplierId);
    }
}
