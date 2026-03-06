package mls.sho.dms.application.service.inventory.impl;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.inventory.CreateIngredientRequest;
import mls.sho.dms.application.dto.inventory.IngredientResponse;
import mls.sho.dms.application.exception.ResourceNotFoundException;
import mls.sho.dms.application.service.inventory.IngredientService;
import mls.sho.dms.entity.inventory.InventoryTransaction;
import mls.sho.dms.entity.inventory.InventoryTransactionType;
import mls.sho.dms.entity.inventory.RawIngredient;
import mls.sho.dms.entity.inventory.Supplier;
import mls.sho.dms.repository.inventory.InventoryTransactionRepository;
import mls.sho.dms.repository.inventory.RawIngredientRepository;
import mls.sho.dms.repository.inventory.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class IngredientServiceImpl implements IngredientService {

    private final RawIngredientRepository ingredientRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryTransactionRepository transactionRepository;

    @Override
    public IngredientResponse create(CreateIngredientRequest request) {
        if (ingredientRepository.existsByNameIgnoreCase(request.name())) {
            throw new IllegalArgumentException("Ingredient with name " + request.name() + " already exists.");
        }

        RawIngredient ingredient = new RawIngredient();
        ingredient.setName(request.name());
        ingredient.setUnitOfMeasure(request.unitOfMeasure());
        ingredient.setCostPerUnit(request.costPerUnit());
        ingredient.setYieldPct(request.yieldPct());
        ingredient.setParLevel(request.parLevel());
        ingredient.setReorderPoint(request.reorderPoint());
        ingredient.setSafetyLevel(request.safetyLevel());
        ingredient.setCriticalLevel(request.criticalLevel());
        ingredient.setMaxStockLevel(request.maxStockLevel());
        ingredient.setAutoReplenish(request.autoReplenish());
        if (request.allergens() != null) {
            ingredient.setAllergens(request.allergens());
        }

        if (request.supplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.supplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
            ingredient.setSupplier(supplier);
        }

        RawIngredient saved = ingredientRepository.save(ingredient);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public IngredientResponse findById(UUID id) {
        return ingredientRepository.findById(id)
            .map(this::mapToResponse)
            .orElseThrow(() -> new ResourceNotFoundException("Ingredient not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<IngredientResponse> findAll() {
        return ingredientRepository.findAll().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<IngredientResponse> findLowStock() {
        return ingredientRepository.findLowStockIngredients().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    @Override
    public void updateStock(UUID id, BigDecimal delta, InventoryTransactionType type, String reason, UUID referenceId) {
        RawIngredient ingredient = ingredientRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ingredient not found"));

        BigDecimal oldStock = ingredient.getCurrentStock();
        BigDecimal newStock = oldStock.add(delta);
        ingredient.setCurrentStock(newStock);
        ingredientRepository.save(ingredient);

        InventoryTransaction transaction = new InventoryTransaction();
        transaction.setIngredient(ingredient);
        transaction.setTransactionType(type);
        transaction.setQuantityDelta(delta);
        transaction.setUnitCostAtTime(ingredient.getCostPerUnit());
        transaction.setReason(reason);
        transaction.setReferenceId(referenceId);
        transaction.setTransactedAt(Instant.now());
        transactionRepository.save(transaction);
    }

    private IngredientResponse mapToResponse(RawIngredient ingredient) {
        return new IngredientResponse(
            ingredient.getId(),
            ingredient.getName(),
            ingredient.getUnitOfMeasure(),
            ingredient.getCostPerUnit(),
            ingredient.getYieldPct(),
            ingredient.getEffectiveCostPerUnit(),
            ingredient.getCurrentStock(),
            ingredient.getParLevel(),
            ingredient.getReorderPoint(),
            ingredient.getSafetyLevel(),
            ingredient.getCriticalLevel(),
            ingredient.getMaxStockLevel(),
            ingredient.isAutoReplenish(),
            ingredient.getAllergens().stream().map(Enum::name).collect(Collectors.toSet()),
            ingredient.getSupplier() != null ? ingredient.getSupplier().getId() : null,
            ingredient.getSupplier() != null ? ingredient.getSupplier().getCompanyName() : null
        );
    }
}
