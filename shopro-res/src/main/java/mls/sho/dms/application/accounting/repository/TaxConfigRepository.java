package mls.sho.dms.application.accounting.repository;

import mls.sho.dms.application.accounting.entity.TaxConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaxConfigRepository extends JpaRepository<TaxConfig, UUID> {

    List<TaxConfig> findByCountryCodeAndIsActiveTrue(String countryCode);

    List<TaxConfig> findByRestaurantIdAndIsActiveTrue(Long restaurantId);

    List<TaxConfig> findByRestaurantIdAndCountryCode(Long restaurantId, String countryCode);

    List<TaxConfig> findByRestaurantIdAndCountryCodeAndStateCode(Long restaurantId, String countryCode, String stateCode);
}
