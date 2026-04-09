package mls.sho.dms.application.kds.service.impl;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.kds.entity.*;
import mls.sho.dms.application.kds.event.KdsQueueChangedEvent;
import mls.sho.dms.application.kds.repository.KdsTicketItemRepository;
import mls.sho.dms.application.kds.repository.KdsTicketRepository;
import mls.sho.dms.application.kds.repository.StationTicketItemRepository;
import mls.sho.dms.application.kds.service.KdsVoidService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class KdsVoidServiceImpl implements KdsVoidService {

    private final KdsTicketRepository ticketRepository;
    private final KdsTicketItemRepository ticketItemRepository;
    private final StationTicketItemRepository stationTicketItemRepository;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Void an individual item that has already been fired.
     * Called by expo when a server comes to the pass with
     * a cancellation.
     *
     * Flash behaviour:
     *   - Item turns red and pulses on all station screens
     *     showing it for 5 seconds
     *   - Audio alert fires if KdsSettings.enableAudioAlerts
     *   - After 5 seconds, item card is removed from queue
     *
     * If the item was already DONE (bumped), a "discard"
     * notification appears on the station screen:
     *   "Discard: Grilled Salmon · Table 7 · voided by server"
     *
     * Delegates to KdsVoidService.voidItem().
     */
    @Override
    @Transactional
    public void voidItem(Long ticketItemId, String reason, Long actorUserId) {
        KdsTicketItem item = ticketItemRepository.findById(ticketItemId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket item not found: " + ticketItemId));
        
        item.setStatus(KdsTicketItem.ItemStatus.VOIDED);
        item.getStationItems().forEach(si -> si.setStatus(StationTicketItem.StationItemStatus.VOIDED));
        
        ticketItemRepository.save(item);
        
        // Notify stations
        eventPublisher.publishEvent(new KdsQueueChangedEvent(item.getTicket().getOutletId(), null));
    }

    /**
     * Void an entire ticket.
     * ALL station screens showing any part of this ticket
     * flash red for 5 seconds, then the ticket card disappears.
     *
     * Delegates to KdsVoidService.voidTicket().
     */
    @Override
    @Transactional
    public void voidTicket(Long ticketId, String reason, Long actorUserId) {
        KdsTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));
        
        ticket.setStatus(KdsTicket.TicketStatus.VOIDED);
        ticket.getItems().forEach(item -> {
            item.setStatus(KdsTicketItem.ItemStatus.VOIDED);
            item.getStationItems().forEach(si -> si.setStatus(StationTicketItem.StationItemStatus.VOIDED));
        });
        
        ticketRepository.save(ticket);
        
        // Notify stations
        eventPublisher.publishEvent(new KdsQueueChangedEvent(ticket.getOutletId(), null));
    }
}
