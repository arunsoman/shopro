package mls.sho.dms.application.kds.service;

/**
 * Service for voiding tickets and items.
 */
/**
 * Service for voiding KDS items and tickets.
 */
public interface KdsVoidService {

    /**
     * Void an individual item that has already been fired.
     */
    void voidItem(Long ticketItemId, String reason, Long actorUserId);

    /**
     * Void an entire ticket.
     */
    void voidTicket(Long ticketId, String reason, Long actorUserId);
}
