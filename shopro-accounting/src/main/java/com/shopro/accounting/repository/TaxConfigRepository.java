package com.shopro.accounting.repository;

import com.shopro.accounting.entity.TaxConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaxConfigRepository extends JpaRepository<TaxConfig, UUID> {
    
    List<TaxConfig> findByRestaurantId(Long restaurantId);
    
    List<TaxConfig> findByCountryCodeAndTaxType(String countryCode, TaxConfig.TaxType taxType);
    
    Optional<TaxConfig> findByRestaurantIdAndTaxName(Long restaurantId, String taxName);
}
