-- ============================================================
-- V13: Inventory Balance — Single Source of Truth
-- ============================================================
-- Purpose:
--   1. Resync inventory_ingredient_balance from the ledger (one-time correction)
--   2. Sync ingredient.on_hand to match for any legacy readers
--   3. Drop the DB triggers that maintained the balance table
--      → InventoryBalanceService (application layer) takes over
--
-- WHY: DB triggers are opaque, hard to test, and run outside the
-- transaction control of the application service layer. The balance
-- is now maintained by InventoryBalanceService.applyLedgerEntry()
-- which is called immediately after every ledger INSERT within
-- the same @Transactional boundary.
--
-- CONSTRAINT RETAINED: chk_balance_not_negative stays.
--   The application clamps balance to 0 before writing (zero-floor),
--   so over-depletion ledger entries (negative qty) do NOT subtract
--   past zero in the balance table.
-- ============================================================

-- ----------------------------------------------------------------
-- Step 1: Insert balance rows for any ingredient+restaurant pairs
--         that have ledger entries but no balance row yet
-- ----------------------------------------------------------------
INSERT INTO inventory_ingredient_balance (
    restaurant_id,
    ingredient_id,
    current_balance,
    last_movement_at,
    last_movement_type,
    created_at,
    updated_at
)
SELECT
    l.restaurant_id,
    l.ingredient_id,
    GREATEST(COALESCE(SUM(l.quantity), 0), 0),  -- clamp to 0, honouring constraint
    MAX(l.created_at),
    (
        SELECT event_type
        FROM inventory_ingredient_ledger
        WHERE restaurant_id = l.restaurant_id
          AND ingredient_id = l.ingredient_id
        ORDER BY created_at DESC
        LIMIT 1
    ),
    NOW(),
    NOW()
FROM inventory_ingredient_ledger l
WHERE NOT EXISTS (
    SELECT 1
    FROM inventory_ingredient_balance b
    WHERE b.restaurant_id = l.restaurant_id
      AND b.ingredient_id = l.ingredient_id
)
GROUP BY l.restaurant_id, l.ingredient_id;

-- ----------------------------------------------------------------
-- Step 2: Resync existing balance rows from ledger
-- ----------------------------------------------------------------
UPDATE inventory_ingredient_balance iib
SET current_balance = GREATEST(
        (
            SELECT COALESCE(SUM(quantity), 0)
            FROM inventory_ingredient_ledger
            WHERE ingredient_id = iib.ingredient_id
              AND restaurant_id = iib.restaurant_id
        ),
        0  -- clamp: honour chk_balance_not_negative
    ),
    last_movement_at = NOW(),
    updated_at       = NOW();

-- ----------------------------------------------------------------
-- Step 3: Sync ingredient.on_hand so legacy read paths agree
--         (on_hand is deprecated — will be dropped in V14+)
-- ----------------------------------------------------------------
UPDATE ingredient i
SET on_hand = (
    SELECT COALESCE(iib.current_balance, 0)
    FROM inventory_ingredient_balance iib
    WHERE iib.ingredient_id = i.id
      AND iib.restaurant_id = i.restaurant_id
)
WHERE EXISTS (
    SELECT 1
    FROM inventory_ingredient_balance iib
    WHERE iib.ingredient_id = i.id
      AND iib.restaurant_id = i.restaurant_id
);

-- ----------------------------------------------------------------
-- Step 4: Pre-flight check — report any remaining drift
-- ----------------------------------------------------------------
DO $$
DECLARE
    drift_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO drift_count
    FROM inventory_ingredient_balance iib
    JOIN (
        SELECT restaurant_id, ingredient_id, COALESCE(SUM(quantity), 0) AS ledger_sum
        FROM inventory_ingredient_ledger
        GROUP BY restaurant_id, ingredient_id
    ) led ON led.restaurant_id = iib.restaurant_id
         AND led.ingredient_id = iib.ingredient_id
    WHERE ABS(iib.current_balance - GREATEST(led.ledger_sum, 0)) > 0.001;

    IF drift_count > 0 THEN
        RAISE WARNING 'V13: % balance rows still have drift after resync — investigate manually.', drift_count;
    ELSE
        RAISE NOTICE 'V13: All balance rows are consistent with ledger.';
    END IF;
END $$;

-- ----------------------------------------------------------------
-- Step 5: Drop DB triggers (application layer takes over)
-- ----------------------------------------------------------------

-- Drop the summary-maintenance trigger (InventoryBalanceService replaces this)
DROP TRIGGER IF EXISTS trg_ledger_maintain_summary ON inventory_ingredient_ledger;

-- Drop the running-balance trigger (no longer needed; running_balance column stays
-- for historical queries but is not maintained going forward)
DROP TRIGGER IF EXISTS trg_ledger_update_running_balance ON inventory_ingredient_ledger;

-- Keep the trigger FUNCTIONS in place so they can be re-enabled in an emergency:
--   CREATE TRIGGER trg_ledger_maintain_summary AFTER INSERT ON inventory_ingredient_ledger
--   FOR EACH ROW EXECUTE FUNCTION fn_ledger_maintain_summary();

-- ----------------------------------------------------------------
-- MIGRATION COMPLETE
-- ----------------------------------------------------------------
-- What changed:
--   ✓ inventory_ingredient_balance resynced from ledger (authoritative source)
--   ✓ ingredient.on_hand synced for backward compatibility
--   ✓ trg_ledger_maintain_summary DROPPED
--   ✓ trg_ledger_update_running_balance DROPPED
--   ✓ Application service (InventoryBalanceService) now owns balance maintenance
-- ----------------------------------------------------------------
