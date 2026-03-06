package mls.sho.dms.entity.order;

/**
 * OPEN          — Ticket created, items being added. No items sent to KDS yet.
 * SUBMITTED     — At least one item sent to KDS. Ticket still being built or eating in progress.
 * PARTIALLY_PAID — Bill-split in progress; some sub-tickets paid, others not.
 * PAID          — Full balance settled. Table transitions to DIRTY.
 * VOIDED        — Entire ticket cancelled (requires Manager PIN if any items were already prepared).
 */
public enum TicketStatus {
    OPEN,
    SUBMITTED,
    READY,
    SERVED,
    PARTIALLY_PAID,
    PAID,
    VOIDED
}
