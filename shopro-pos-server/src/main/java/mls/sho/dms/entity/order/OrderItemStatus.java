package mls.sho.dms.entity.order;

/**
 * PENDING   — Item on ticket, not yet sent to KDS.
 * SENT      — Fired to KDS; kitchen is preparing.
 * READY     — Marked ready by Line Cook / Expeditor.
 * DELIVERED — Served to guest.
 * VOIDED    — Removed from ticket (pre-prep: stock restored; post-prep: logged as waste).
 */
public enum OrderItemStatus {
    PENDING,
    HELD,
    SENT,
    READY,
    DELIVERED,
    VOIDED
}
