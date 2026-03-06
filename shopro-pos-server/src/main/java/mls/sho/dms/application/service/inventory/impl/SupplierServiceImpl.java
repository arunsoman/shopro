package mls.sho.dms.application.service.inventory.impl;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.inventory.CreateSupplierRequest;
import mls.sho.dms.application.dto.inventory.PriceComparisonResponse;
import mls.sho.dms.application.dto.inventory.SupplierCatalogImportRequest;
import mls.sho.dms.application.dto.inventory.SupplierResponse;
import mls.sho.dms.application.service.inventory.SupplierService;
import mls.sho.dms.entity.inventory.RawIngredient;
import mls.sho.dms.entity.inventory.Supplier;
import mls.sho.dms.entity.inventory.SupplierIngredientPricing;
import mls.sho.dms.repository.inventory.RawIngredientRepository;
import mls.sho.dms.repository.inventory.SupplierIngredientPricingRepository;
import mls.sho.dms.repository.inventory.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final RawIngredientRepository ingredientRepository;
    private final SupplierIngredientPricingRepository pricingRepository;

    @Override
    @Transactional
    public SupplierResponse create(CreateSupplierRequest request) {
        if (supplierRepository.existsByCompanyNameIgnoreCase(request.companyName())) {
            throw new IllegalArgumentException("Supplier with name " + request.companyName() + " already exists");
        }

        Supplier supplier = new Supplier();
        supplier.setCompanyName(request.companyName());
        supplier.setContactName(request.contactName());
        supplier.setContactEmail(request.contactEmail());
        supplier.setContactPhone(request.contactPhone());
        supplier.setLeadTimeDays(request.leadTimeDays());

        supplier = supplierRepository.save(supplier);
        return mapToResponse(supplier);
    }

    @Override
    public SupplierResponse findById(UUID id) {
        return supplierRepository.findById(id)
            .map(this::mapToResponse)
            .orElseThrow(() -> new IllegalArgumentException("Supplier not found: " + id));
    }

    @Override
    public List<SupplierResponse> findAll() {
        return supplierRepository.findAll().stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional
    public void importCatalog(UUID supplierId, SupplierCatalogImportRequest request) {
        Supplier supplier = supplierRepository.findById(supplierId)
            .orElseThrow(() -> new IllegalArgumentException("Supplier not found: " + supplierId));

        for (var item : request.items()) {
            if (item.mappedIngredientId() == null) continue;

            RawIngredient ingredient = ingredientRepository.findById(item.mappedIngredientId())
                .orElseThrow(() -> new IllegalArgumentException("Ingredient not found: " + item.mappedIngredientId()));

            SupplierIngredientPricing pricing = pricingRepository.findBySupplierAndIngredient(supplier, ingredient)
                .orElse(new SupplierIngredientPricing());

            pricing.setSupplier(supplier);
            pricing.setIngredient(ingredient);
            pricing.setUnitPrice(item.unitPrice());
            pricing.setVendorSku(item.vendorSku());
            pricing.setLastUpdatedAt(Instant.now());

            pricingRepository.save(pricing);
        }
    }

    @Override
    public PriceComparisonResponse getPriceComparison(UUID ingredientId) {
        RawIngredient ingredient = ingredientRepository.findById(ingredientId)
            .orElseThrow(() -> new IllegalArgumentException("Ingredient not found: " + ingredientId));

        List<SupplierIngredientPricing> prices = pricingRepository.findAllByIngredient(ingredient);
        
        BigDecimal lowestPrice = prices.stream()
            .map(SupplierIngredientPricing::getUnitPrice)
            .min(Comparator.naturalOrder())
            .orElse(BigDecimal.ZERO);

        List<PriceComparisonResponse.SupplierPrice> supplierPrices = prices.stream()
            .map(p -> new PriceComparisonResponse.SupplierPrice(
                p.getSupplier().getId(),
                p.getSupplier().getCompanyName(),
                p.getUnitPrice(),
                p.getVendorSku(),
                p.getSupplier().getLeadTimeDays(),
                p.getSupplier().getVendorRating(),
                p.getUnitPrice().compareTo(lowestPrice) == 0 && lowestPrice.compareTo(BigDecimal.ZERO) > 0
            ))
            .sorted(Comparator.comparing(PriceComparisonResponse.SupplierPrice::price))
            .toList();

        return new PriceComparisonResponse(
            ingredient.getId(),
            ingredient.getName(),
            supplierPrices
        );
    }

    private SupplierResponse mapToResponse(Supplier s) {
        return new SupplierResponse(
            s.getId(),
            s.getCompanyName(),
            s.getContactName(),
            s.getContactEmail(),
            s.getContactPhone(),
            s.getLeadTimeDays(),
            s.getVendorRating()
        );
    }
}
