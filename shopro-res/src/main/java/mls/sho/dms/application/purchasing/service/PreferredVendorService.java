package mls.sho.dms.application.purchasing.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.purchasing.dto.PreferredVendorDto;
import mls.sho.dms.application.purchasing.repository.PreferredVendorRepository;
import mls.sho.dms.application.purchasing.entity.PreferredVendor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PreferredVendorService {

    private final PreferredVendorRepository preferredVendorRepository;

    public List<PreferredVendorDto> getAllPreferredVendors(Long restaurantId) {
        return preferredVendorRepository.findByRestaurantIdAndActiveTrue(restaurantId).stream()
                .map(this::toDto).toList();
    }

    public Optional<PreferredVendorDto> getPreferredVendor(Long restaurantId, Long ingredientId) {
        return preferredVendorRepository.findPreferredVendor(restaurantId, ingredientId)
                .map(this::toDto);
    }

    public List<PreferredVendorDto> getAllVendorsForIngredient(Long restaurantId, Long ingredientId) {
        return preferredVendorRepository.findAllVendorsForIngredient(restaurantId, ingredientId).stream()
                .map(this::toDto).toList();
    }

    public List<PreferredVendorDto> getIngredientsBySupplier(Long supplierId) {
        return preferredVendorRepository.findBySupplierId(supplierId).stream()
                .map(this::toDto).toList();
    }

    @Transactional
    public PreferredVendorDto createPreferredVendor(PreferredVendor preferredVendor) {
        preferredVendor.setCreatedAt(LocalDateTime.now());
        preferredVendor.setUpdatedAt(LocalDateTime.now());
        return toDto(preferredVendorRepository.save(preferredVendor));
    }

    @Transactional
    public PreferredVendorDto updatePreferredVendor(Long id, PreferredVendor updated) {
        PreferredVendor existing = preferredVendorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PreferredVendor not found: " + id));

        existing.setPreferred(updated.isPreferred());
        existing.setUnitCost(updated.getUnitCost());
        existing.setLeadTimeDays(updated.getLeadTimeDays());
        existing.setMinimumOrderQty(updated.getMinimumOrderQty());
        existing.setDiscountPct(updated.getDiscountPct());
        existing.setNotes(updated.getNotes());
        existing.setActive(updated.isActive());
        existing.setUpdatedAt(LocalDateTime.now());

        return toDto(preferredVendorRepository.save(existing));
    }

    @Transactional
    public void setPreferredVendor(Long restaurantId, Long ingredientId, Long supplierId, BigDecimal unitCost) {
        // First, unset any existing preferred flag for this ingredient
        List<PreferredVendor> existing = preferredVendorRepository.findAllVendorsForIngredient(restaurantId, ingredientId);
        for (PreferredVendor pv : existing) {
            if (pv.isPreferred()) {
                pv.setPreferred(false);
                pv.setUpdatedAt(LocalDateTime.now());
                preferredVendorRepository.save(pv);
            }
        }

        // Find or create the new preferred vendor
        Optional<PreferredVendor> optPv = existing.stream()
                .filter(pv -> pv.getSupplier().getId().equals(supplierId))
                .findFirst();

        PreferredVendor pv;
        if (optPv.isPresent()) {
            pv = optPv.get();
        } else {
            throw new IllegalArgumentException("Supplier " + supplierId + " is not linked to ingredient " + ingredientId);
        }

        pv.setPreferred(true);
        pv.setUnitCost(unitCost);
        pv.setUpdatedAt(LocalDateTime.now());
        preferredVendorRepository.save(pv);

        log.info("Set preferred vendor: ingredient={}, supplier={}", ingredientId, supplierId);
    }

    @Transactional
    public void deletePreferredVendor(Long id) {
        PreferredVendor pv = preferredVendorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PreferredVendor not found: " + id));
        pv.setActive(false);
        pv.setUpdatedAt(LocalDateTime.now());
        preferredVendorRepository.save(pv);
    }

    public boolean hasPreferredVendor(Long restaurantId, Long ingredientId) {
        return preferredVendorRepository.existsByRestaurantIdAndIngredientIdAndPreferredTrue(restaurantId, ingredientId);
    }

    private PreferredVendorDto toDto(PreferredVendor pv) {
        PreferredVendorDto dto = new PreferredVendorDto();
        dto.setId(pv.getId());
        dto.setRestaurantId(pv.getRestaurant() != null ? pv.getRestaurant().getId() : null);
        dto.setIngredientId(pv.getIngredient() != null ? pv.getIngredient().getId() : null);
        dto.setIngredientName(pv.getIngredient() != null ? pv.getIngredient().getDescription() : null);
        dto.setSupplierId(pv.getSupplier() != null ? pv.getSupplier().getId() : null);
        dto.setSupplierName(pv.getSupplier() != null ? pv.getSupplier().getName() : null);
        dto.setPreferred(pv.isPreferred());
        dto.setUnitCost(pv.getUnitCost());
        dto.setLeadTimeDays(pv.getLeadTimeDays());
        dto.setMinimumOrderQty(pv.getMinimumOrderQty());
        dto.setDiscountPct(pv.getDiscountPct());
        dto.setNotes(pv.getNotes());
        dto.setActive(pv.isActive());
        dto.setCreatedAt(pv.getCreatedAt());
        dto.setUpdatedAt(pv.getUpdatedAt());
        return dto;
    }
}