package mls.sho.dms.application.inventory.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.inventory.entity.Ingredient;
import mls.sho.dms.application.inventory.repository.InventoryBalanceRepository;
import mls.sho.dms.application.inventory.entity.InventoryIngredientBalance;
import mls.sho.dms.application.inventory.entity.InventoryIngredientLedger;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Single application-layer maintainer of {@link InventoryIngredientBalance}.
 *
 * <p>Replaces the DB trigger {@code trg_ledger_maintain_summary} (dropped in V13 migration).
 * Called immediately after every {@code inventory_ingredient_ledger} save so that
 * {@code inventory_ingredient_balance} is always consistent with the ledger within the
 * same transaction.</p>
 *
 * <p>Balance is clamped to zero — negative values are never written (matching the
 * {@code chk_balance_not_negative} DB constraint).</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryBalanceService {

    private final InventoryBalanceRepository balanceRepo;

    /**
     * Apply a single saved ledger entry to the balance summary table.
     *
     * @param entry a *persisted* ledger entry (id must be set)
     */
    @Transactional
    public void applyLedgerEntry(InventoryIngredientLedger entry) {
        if (entry == null || entry.getIngredient() == null || entry.getRestaurant() == null) {
            log.warn("InventoryBalanceService: skipping null/incomplete ledger entry");
            return;
        }

        InventoryIngredientBalance balance = balanceRepo
                .findByRestaurantIdAndIngredientId(
                        entry.getRestaurant().getId(),
                        entry.getIngredient().getId())
                .orElseGet(() -> safeCreateZeroBalance(entry.getRestaurant(), entry.getIngredient()));

        balance.apply(entry);
        balanceRepo.save(balance);

        log.debug("Balance updated → restaurant={} ingredient={} newBalance={}",
                entry.getRestaurant().getId(),
                entry.getIngredient().getId(),
                balance.getCurrentBalance());
    }

    /**
     * Helper to safely persist a zero balance, catching constraint violations
     * if another thread beats us to creating it.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    protected InventoryIngredientBalance safeCreateZeroBalance(mls.sho.dms.entity.Restaurant restaurant, Ingredient ingredient) {
        try {
            InventoryIngredientBalance balance = InventoryIngredientBalance.zero(restaurant, ingredient);
            return balanceRepo.saveAndFlush(balance);
        } catch (DataIntegrityViolationException e) {
            // Another thread created it. Fetch and return.
            return balanceRepo.findByRestaurantIdAndIngredientId(restaurant.getId(), ingredient.getId())
                    .orElseThrow(() -> new IllegalStateException("Balance should exist but not found for retry"));
        }
    }

    /**
     * Apply multiple saved ledger entries in bulk.
     * Entries for the same ingredient are applied in list order, so the caller
     * must pass them in chronological order (oldest first) when order matters.
     *
     * @param entries list of *persisted* ledger entries
     */
    @Transactional
    public void applyLedgerEntries(List<InventoryIngredientLedger> entries) {
        if (entries == null || entries.isEmpty()) return;

        Long restaurantId = entries.get(0).getRestaurant() != null ? entries.get(0).getRestaurant().getId() : null;
        if (restaurantId == null) return;

        List<Long> ingredientIds = entries.stream()
                .filter(e -> e.getIngredient() != null)
                .map(e -> e.getIngredient().getId())
                .distinct()
                .collect(java.util.stream.Collectors.toList());

        if (ingredientIds.isEmpty()) return;

        java.util.Map<Long, InventoryIngredientBalance> balances = balanceRepo
                .findAllByRestaurantIdAndIngredientIdIn(restaurantId, ingredientIds).stream()
                .collect(java.util.stream.Collectors.toMap(b -> b.getIngredient().getId(), b -> b));

        for (InventoryIngredientLedger entry : entries) {
            if (entry == null || entry.getIngredient() == null || entry.getRestaurant() == null) {
                continue;
            }

            InventoryIngredientBalance balance = balances.computeIfAbsent(
                entry.getIngredient().getId(), 
                id -> safeCreateZeroBalance(entry.getRestaurant(), entry.getIngredient())
            );

            balance.apply(entry);
            
            if (log.isDebugEnabled()) {
                log.debug("Balance updated → restaurant={} ingredient={} newBalance={}",
                        entry.getRestaurant().getId(),
                        entry.getIngredient().getId(),
                        balance.getCurrentBalance());
            }
        }

        balanceRepo.saveAll(balances.values());
    }
}
