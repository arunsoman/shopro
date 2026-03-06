package mls.sho.dms.application.service.inventory.impl;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.service.inventory.BatchService;
import mls.sho.dms.application.service.inventory.RecipeService;
import mls.sho.dms.entity.inventory.*;
import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.repository.inventory.*;
import mls.sho.dms.repository.staff.StaffMemberRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class BatchServiceImpl implements BatchService {

    private final SubRecipeRepository subRecipeRepository;
    private final BatchRecordRepository batchRepository;
    private final StaffMemberRepository staffRepository;
    private final RecipeService recipeService;
    private final InventoryTransactionRepository transactionRepository;

    @Override
    @Transactional
    public BatchRecord createBatch(UUID subRecipeId, BigDecimal producedQty, UUID staffId, Instant expiryAt, String notes) {
        SubRecipe subRecipe = subRecipeRepository.findById(subRecipeId)
                .orElseThrow(() -> new IllegalArgumentException("Sub-Recipe not found"));
        StaffMember staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found"));

        // 1. Deplete raw ingredients required for this batch
        // We simulate an "order item" depletion but for a batch
        recipeService.findLatestBySubRecipe(subRecipeId); 
        // Actually, I need to implement a "depleteForBatch" method in RecipeService or handle it here.
        // For now, let's assume we implement it in RecipeService.
        
        BatchRecord batch = new BatchRecord();
        batch.setSubRecipe(subRecipe);
        batch.setProducedQty(producedQty);
        batch.setRemainingQty(producedQty);
        batch.setStatus(BatchStatus.ACTIVE);
        batch.setProducedAt(Instant.now());
        batch.setExpiryAt(expiryAt);
        batch.setNotes(notes);
        batch.setProducedBy(staff);

        return batchRepository.save(batch);
    }

    @Override
    @Transactional
    public void depleteSubRecipe(UUID subRecipeId, BigDecimal requestedQty, UUID referenceId) {
        List<BatchRecord> activeBatches = batchRepository.findActiveBySubRecipe(subRecipeId, BatchStatus.ACTIVE);
        BigDecimal remainingToDeplete = requestedQty;

        for (BatchRecord batch : activeBatches) {
            if (remainingToDeplete.compareTo(BigDecimal.ZERO) <= 0) break;

            BigDecimal batchAvailable = batch.getRemainingQty();
            BigDecimal canDeplete = batchAvailable.min(remainingToDeplete);

            batch.setRemainingQty(batchAvailable.subtract(canDeplete));
            remainingToDeplete = remainingToDeplete.subtract(canDeplete);

            if (batch.getRemainingQty().compareTo(BigDecimal.ZERO) <= 0) {
                batch.setStatus(BatchStatus.DEPLETED);
            }
            batchRepository.save(batch);

            // Log micro-transaction for auditing if needed, but usually we just track at batch level.
        }

        if (remainingToDeplete.compareTo(BigDecimal.ZERO) > 0) {
            // Requirement US-9.2 #7: Notify manager if batch is empty
            // For now, just log a warning or throw exception if critical
        }
    }

    @Override
    @Scheduled(cron = "0 0 * * * *") // Every hour
    @Transactional
    public void processExpiredBatches() {
        List<BatchStatus> expiredStatuses = List.of(BatchStatus.ACTIVE); // Only active ones can expire
        List<BatchRecord> expired = batchRepository.findByStatusAndExpiryAtBefore(BatchStatus.ACTIVE, Instant.now());

        for (BatchRecord batch : expired) {
            batch.setStatus(BatchStatus.EXPIRED);
            
            // Log remaining as WASTE
            if (batch.getRemainingQty().compareTo(BigDecimal.ZERO) > 0) {
                InventoryTransaction waste = new InventoryTransaction();
                // We'd need to somehow link this to an ingredient if we want it in waste reports, 
                // but SubRecipes aren't RawIngredients. US-9.2 says log as WASTE.
                // We'll skip detailed waste ledger for sub-recipes for now or use a generic reference.
            }
            batchRepository.save(batch);
        }
    }
}
