package mls.sho.dms.application.service.inventory;

import mls.sho.dms.application.dto.inventory.CreateIngredientRequest;
import mls.sho.dms.application.dto.inventory.IngredientResponse;
import mls.sho.dms.application.dto.inventory.LogWasteRequest;
import mls.sho.dms.entity.inventory.InventoryTransactionType;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface IngredientService {
    IngredientResponse create(CreateIngredientRequest request);
    IngredientResponse findById(UUID id);
    List<IngredientResponse> findAll();
    List<IngredientResponse> findLowStock();

    void updateStock(UUID id, BigDecimal delta, InventoryTransactionType type, String reason, UUID referenceId);
}
