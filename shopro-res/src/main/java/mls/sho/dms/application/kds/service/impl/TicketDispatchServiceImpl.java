package mls.sho.dms.application.kds.service.impl;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.kds.dto.KdsDtos.ManualTicketRequest;
import mls.sho.dms.application.kds.entity.*;
import mls.sho.dms.application.kds.event.KdsQueueChangedEvent;
import mls.sho.dms.application.kds.repository.KdsTicketRepository;
import mls.sho.dms.application.kds.repository.StationRoutingRepository;
import mls.sho.dms.application.kds.service.TicketDispatchService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketDispatchServiceImpl implements TicketDispatchService {

    private final KdsTicketRepository ticketRepository;
    private final StationRoutingRepository routingRepository;
    private final mls.sho.dms.application.kds.repository.KdsStationRepository stationRepository;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Fire a new ticket from the expo screen.
     * Used for verbal orders, walk-in corrections, or when
     * the POS is down. source = MANUAL.
     *
     * The expo can specify individual items, quantities,
     * modifications, allergen flags, course numbers,
     * and which table/guest the ticket belongs to.
     *
     * Delegates to TicketDispatchService.createManualTicket().
     */
    @Override
    @Transactional
    public KdsTicket createManualTicket(Long outletId, ManualTicketRequest req) {
        KdsTicket ticket = KdsTicket.builder()
                .outletId(outletId)
                .ticketNumber(req.getTicketNumber())
                .guestCount(req.getGuestCount())
                .source(KdsTicket.TicketSource.MANUAL)
                .status(KdsTicket.TicketStatus.ACTIVE)
                .serverNote(req.getServerNote())
                .firedAt(LocalDateTime.now())
                .build();

        List<KdsTicketItem> items = new ArrayList<>();
        req.getItems().forEach(itemReq -> {
            KdsTicketItem item = KdsTicketItem.builder()
                    .ticket(ticket)
                    .menuItemId(itemReq.getMenuItemId())
                    .menuItemName(itemReq.getMenuItemName())
                    .pluNumber(itemReq.getPluNumber())
                    .quantity(itemReq.getQuantity())
                    .courseNumber(itemReq.getCourseNumber())
                    .modifications(itemReq.getModifications() != null ? String.join(", ", itemReq.getModifications()) : null)
                    .allergenFlags(itemReq.getAllergenFlags() != null ? String.join("|", itemReq.getAllergenFlags()) : null)
                    .status(KdsTicketItem.ItemStatus.NEW)
                    .build();
            
            // Basic routing logic: find stations for this item
            // For now, let's just route to every station in the outlet for simplicity if no specific rules
            List<StationRouting> routings = routingRepository.findByStationOutletId(outletId);
            List<StationTicketItem> stationItems = new ArrayList<>();
            routings.forEach(routing -> {
                // Simplified matching: match by menu item ID or PLU
                boolean matches = false;
                if (routing.getRoutingType() == StationRouting.RoutingType.MENU_ITEM_ID && String.valueOf(item.getMenuItemId()).equals(routing.getRoutingKey())) {
                    matches = true;
                } else if (routing.getRoutingType() == StationRouting.RoutingType.PLU && String.valueOf(item.getPluNumber()).equals(routing.getRoutingKey())) {
                    matches = true;
                }
                
                if (matches) {
                    stationItems.add(StationTicketItem.builder()
                            .ticketItem(item)
                            .station(routing.getStation())
                            .status(StationTicketItem.StationItemStatus.NEW)
                            .build());
                }
            });
            
            
            // Fallback: If no routing match found, route to default station
            if (stationItems.isEmpty()) {
                stationRepository.findFirstByOutletId(outletId).ifPresent(defaultStation -> {
                    stationItems.add(StationTicketItem.builder()
                            .ticketItem(item)
                            .station(defaultStation)
                            .status(StationTicketItem.StationItemStatus.NEW)
                            .build());
                });
            }
            
            item.setStationItems(stationItems);
            items.add(item);
        });

        ticket.setItems(items);
        KdsTicket savedTicket = ticketRepository.save(ticket);
        
        eventPublisher.publishEvent(new KdsQueueChangedEvent(outletId, null));
        
        return savedTicket;
    }
}
