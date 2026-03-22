package mls.sho.mplace.repository;

import mls.sho.mplace.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {
    long countByCategory_Id(UUID categoryId);
    java.util.List<Product> findAllByCategory_Id(UUID categoryId);
    java.util.List<Product> findAllBySupplier_Id(UUID supplierId);
    java.util.Optional<Product> findFirstByNameContainingIgnoreCase(String name);
}
