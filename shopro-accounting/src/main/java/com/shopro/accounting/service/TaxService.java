package com.shopro.accounting.service;

import com.shopro.accounting.entity.TaxConfig;
import com.shopro.accounting.repository.TaxConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaxService {

    private final TaxConfigRepository taxConfigRepository;

    /**
     * Calculates the total tax for a transaction based on the restaurant's location
     * and the tax configuration rules.
     */
    public BigDecimal calculateTax(Long restaurantId, BigDecimal amount, String itemCategory) {
        List<TaxConfig> activeTaxes = taxConfigRepository.findByRestaurantId(restaurantId)
            .stream()
            .filter(TaxConfig::getIsActive)
            .filter(t -> t.getEffectiveFrom() == null || t.getEffectiveFrom().isBefore(LocalDateTime.now()))
            .filter(t -> t.getEffectiveTo() == null || t.getEffectiveTo().isAfter(LocalDateTime.now()))
            .sorted(Comparator.comparing(TaxConfig::getPriority, Comparator.nullsLast(Comparator.naturalOrder())))
            .toList();

        BigDecimal totalTax = BigDecimal.ZERO;
        for (TaxConfig tax : activeTaxes) {
            if (tax.getTaxAppliesTo() == null || tax.getTaxAppliesTo().equalsIgnoreCase(itemCategory)) {
                BigDecimal taxAmount = amount.multiply(tax.getTaxRate().divide(BigDecimal.valueOf(100)));
                totalTax = totalTax.add(taxAmount);
            }
        }
        return totalTax;
    }

    @Transactional
    public TaxConfig saveTaxConfig(TaxConfig config) {
        return taxConfigRepository.save(config);
    }

    public List<TaxConfig> getTaxesForRestaurant(Long restaurantId) {
        return taxConfigRepository.findByRestaurantId(restaurantId);
    }

    /**
     * Seed global tax defaults for a country (e.g., US)
     */
    @Transactional
    public void deleteTax(UUID id) {
        taxConfigRepository.deleteById(id);
    }

    /**
     * Get recommended defaults for a specific country
     */
    public List<TaxConfig> getGlobalDefaultsForCountry(String countryCode) {
        // This would typically be a separate 'seeds' table or a config file
        // Simulating a few common global taxes based on countryCode
        List<TaxConfig> defaults = new ArrayList<>();
        
        if ("US".equalsIgnoreCase(countryCode)) {
            defaults.add(TaxConfig.builder()
                .taxName("Federal Sales Tax")
                .taxType(TaxConfig.TaxType.SALES)
                .taxRate(new BigDecimal("7.00"))
                .priority(1)
                .countryCode("US")
                .description("Baseline Federal Sales Tax")
                .build());
        } else if ("GB".equalsIgnoreCase(countryCode)) {
            defaults.add(TaxConfig.builder()
                .taxName("VAT")
                .taxType(TaxConfig.TaxType.SALES)
                .taxRate(new BigDecimal("20.00"))
                .priority(1)
                .countryCode("GB")
                .description("Standard Value Added Tax")
                .build());
        }
        
        return defaults;
    }
}
