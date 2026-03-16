package mls.sho.dms.application.service.inventory;

import mls.sho.dms.application.dto.inventory.CreateIngredientRequest;
import mls.sho.dms.application.dto.inventory.UpdateIngredientRequest;
import mls.sho.dms.application.dto.inventory.IngredientResponse;
import mls.sho.dms.application.dto.inventory.LogWasteRequest;
import mls.sho.dms.entity.inventory.InventoryTransactionType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface IngredientService {
    IngredientResponse create(CreateIngredientRequest request);
    IngredientResponse update(UUID id, UpdateIngredientRequest request);
    IngredientResponse findById(UUID id);
    Page<IngredientResponse> findAll(Pageable pageable);
    List<IngredientResponse> findDailyPerishables();
    List<IngredientResponse> findLowStock();

    void updateStock(UUID id, BigDecimal delta, InventoryTransactionType type, String reason, UUID referenceId);
}
