package mls.sho.dms.application.inventory.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.inventory.repository.InventoryBalanceRepository;
import mls.sho.dms.entity.InventoryIngredientBalance;
import mls.sho.dms.entity.InventoryIngredientLedger;
import org.springframework.stereotype.Service;
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
@Transactional
@RequiredArgsConstructor
public class InventoryBalanceService {

    private final InventoryBalanceRepository balanceRepo;

    /**
     * Apply a single saved ledger entry to the balance summary table.
     *
     * @param entry a *persisted* ledger entry (id must be set)
     */
    public void applyLedgerEntry(InventoryIngredientLedger entry) {
        if (entry == null || entry.getIngredient() == null || entry.getRestaurant() == null) {
            log.warn("InventoryBalanceService: skipping null/incomplete ledger entry");
            return;
        }

        InventoryIngredientBalance balance = balanceRepo
                .findByRestaurantIdAndIngredientId(
                        entry.getRestaurant().getId(),
                        entry.getIngredient().getId())
                .orElseGet(() -> InventoryIngredientBalance.zero(
                        entry.getRestaurant(), entry.getIngredient()));

        balance.apply(entry);
        balanceRepo.save(balance);

        log.debug("Balance updated → restaurant={} ingredient={} newBalance={}",
                entry.getRestaurant().getId(),
                entry.getIngredient().getId(),
                balance.getCurrentBalance());
    }

    /**
     * Apply multiple saved ledger entries in bulk.
     * Entries for the same ingredient are applied in list order, so the caller
     * must pass them in chronological order (oldest first) when order matters.
     *
     * @param entries list of *persisted* ledger entries
     */
    public void applyLedgerEntries(List<InventoryIngredientLedger> entries) {
        if (entries == null || entries.isEmpty()) return;
        entries.forEach(this::applyLedgerEntry);
    }
}
