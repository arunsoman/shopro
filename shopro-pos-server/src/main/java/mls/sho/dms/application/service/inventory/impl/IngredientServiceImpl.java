package mls.sho.dms.application.service.inventory.impl;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.inventory.CreateIngredientRequest;
import mls.sho.dms.application.dto.inventory.UpdateIngredientRequest;
import mls.sho.dms.application.dto.inventory.IngredientResponse;
import mls.sho.dms.application.exception.ResourceNotFoundException;
import mls.sho.dms.application.service.inventory.AlertService;
import mls.sho.dms.application.service.inventory.IngredientService;
import mls.sho.dms.entity.inventory.InventoryTransaction;
import mls.sho.dms.entity.inventory.InventoryTransactionType;
import mls.sho.dms.entity.inventory.RawIngredient;
import mls.sho.dms.entity.inventory.Supplier;
import mls.sho.dms.repository.inventory.InventoryTransactionRepository;
import mls.sho.dms.repository.inventory.PurchaseOrderRepository;
import mls.sho.dms.repository.inventory.RFQRepository;
import mls.sho.dms.repository.inventory.RawIngredientRepository;
import mls.sho.dms.repository.inventory.SupplierRepository;
import mls.sho.dms.entity.inventory.PurchaseOrderStatus;
import mls.sho.dms.entity.inventory.RfqStatus;
import mls.sho.dms.entity.inventory.PurchaseOrder;
import mls.sho.dms.entity.inventory.RFQ;
import java.util.EnumSet;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final RFQRepository rfqRepository;
    private final AlertService alertService;

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
        ingredient.setRestockingMode(request.restockingMode());
        ingredient.setShelfLifeDays(request.shelfLifeDays());
        ingredient.setStorageType(request.storageType());
        ingredient.setDailyRestockEnrolled(request.dailyRestockEnrolled());
        ingredient.setCategory(request.category());
        if (request.bidSupplierPool() != null) {
            ingredient.setBidSupplierPool(request.bidSupplierPool());
        }
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
    public IngredientResponse update(UUID id, UpdateIngredientRequest request) {
        RawIngredient ingredient = ingredientRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ingredient not found"));

        if (request.name() != null) ingredient.setName(request.name());
        if (request.unitOfMeasure() != null) ingredient.setUnitOfMeasure(request.unitOfMeasure());
        if (request.costPerUnit() != null) ingredient.setCostPerUnit(request.costPerUnit());
        if (request.yieldPct() != null) ingredient.setYieldPct(request.yieldPct());
        if (request.parLevel() != null) ingredient.setParLevel(request.parLevel());
        if (request.reorderPoint() != null) ingredient.setReorderPoint(request.reorderPoint());
        if (request.safetyLevel() != null) ingredient.setSafetyLevel(request.safetyLevel());
        if (request.criticalLevel() != null) ingredient.setCriticalLevel(request.criticalLevel());
        if (request.maxStockLevel() != null) ingredient.setMaxStockLevel(request.maxStockLevel());
        if (request.autoReplenish() != null) ingredient.setAutoReplenish(request.autoReplenish());
        if (request.restockingMode() != null) ingredient.setRestockingMode(request.restockingMode());
        if (request.shelfLifeDays() != null) ingredient.setShelfLifeDays(request.shelfLifeDays());
        if (request.storageType() != null) ingredient.setStorageType(request.storageType());
        if (request.dailyRestockEnrolled() != null) ingredient.setDailyRestockEnrolled(request.dailyRestockEnrolled());
        if (request.category() != null) ingredient.setCategory(request.category());
        if (request.bidSupplierPool() != null) ingredient.setBidSupplierPool(request.bidSupplierPool());
        
        if (request.allergens() != null) {
            ingredient.setAllergens(request.allergens().stream()
                .map(mls.sho.dms.entity.inventory.Allergen::valueOf)
                .collect(Collectors.toSet()));
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
    public Page<IngredientResponse> findAll(Pageable pageable) {
        return ingredientRepository.findAll(pageable)
            .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IngredientResponse> findLowStock() {
        return ingredientRepository.findLowStockIngredients().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<IngredientResponse> findDailyPerishables() {
        return ingredientRepository.findByShelfLifeDays(1).stream()
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

        // Check for alerts
        if (newStock.compareTo(ingredient.getCriticalLevel()) <= 0) {
            alertService.sendCriticalStockAlert(ingredient);
        } else if (newStock.compareTo(ingredient.getSafetyLevel()) <= 0) {
            alertService.sendSafetyStockAlert(ingredient);
        }
    }

    private IngredientResponse mapToResponse(RawIngredient ingredient) {
        // Find active PO
        List<PurchaseOrder> activePos = purchaseOrderRepository.findActiveOrdersByIngredientId(
            ingredient.getId(), 
            EnumSet.of(PurchaseOrderStatus.CLOSED, PurchaseOrderStatus.CANCELLED, PurchaseOrderStatus.REJECTED)
        );

        // Find active RFQ
        List<RFQ> activeRfqs = rfqRepository.findActiveRfqsByIngredientId(
            ingredient.getId(), 
            RfqStatus.OPEN
        );

        UUID activeOrderId = null;
        String activeOrderType = null;
        String activeOrderStatus = null;

        if (!activePos.isEmpty()) {
            activeOrderId = activePos.get(0).getId();
            activeOrderType = "PO";
            activeOrderStatus = activePos.get(0).getStatus().name();
        } else if (!activeRfqs.isEmpty()) {
            activeOrderId = activeRfqs.get(0).getId();
            activeOrderType = "RFQ";
            activeOrderStatus = activeRfqs.get(0).getStatus().name();
        }

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
            ingredient.getRestockingMode(),
            ingredient.getShelfLifeDays(),
            ingredient.getStorageType(),
            ingredient.isDailyRestockEnrolled(),
            ingredient.getCategory(),
            ingredient.getBidSupplierPool(),
            ingredient.getAllergens().stream().map(Enum::name).collect(Collectors.toSet()),
            ingredient.getSupplier() != null ? ingredient.getSupplier().getId() : null,
            ingredient.getSupplier() != null ? ingredient.getSupplier().getCompanyName() : null,
            activeOrderId,
            activeOrderType,
            activeOrderStatus
        );
    }
}
