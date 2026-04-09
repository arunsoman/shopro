package mls.sho.dms.application.service.inventory;

import mls.sho.dms.entity.inventory.recipe.BatchRecord;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public interface BatchService {
    BatchRecord createBatch(UUID subRecipeId, BigDecimal producedQty, UUID staffId, Instant expiryAt, String notes);
    void depleteSubRecipe(UUID subRecipeId, BigDecimal requestedQty, UUID referenceId);
    void processExpiredBatches();
}
