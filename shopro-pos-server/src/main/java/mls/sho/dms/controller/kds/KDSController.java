package mls.sho.dms.controller.kds;

import mls.sho.dms.application.dto.kds.KDSTicketItemResponse;
import mls.sho.dms.application.dto.kds.KDSTicketResponse;
import mls.sho.dms.application.mapper.KDSMapper;
import mls.sho.dms.entity.kds.KDSTicket;
import mls.sho.dms.entity.kds.KDSTicketItem;
import mls.sho.dms.repository.kds.KDSTicketItemRepository;
import mls.sho.dms.service.kds.KDSService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/kds")
public class KDSController {

    private final KDSService kdsService;
    private final KDSMapper kdsMapper;
    private final KDSTicketItemRepository ticketItemRepository;

    public KDSController(KDSService kdsService, KDSMapper kdsMapper, KDSTicketItemRepository ticketItemRepository) {
        this.kdsService = kdsService;
        this.kdsMapper = kdsMapper;
        this.ticketItemRepository = ticketItemRepository;
    }

    @GetMapping("/stations/{stationId}/tickets/active")
    public ResponseEntity<List<KDSTicketResponse>> getActiveTickets(@PathVariable UUID stationId) {
        return ResponseEntity.ok(kdsService.getActiveTicketsForStation(stationId));
    }

    @PostMapping("/items/{itemId}/bump")
    public ResponseEntity<KDSTicketItemResponse> bumpItem(@PathVariable UUID itemId) {
        KDSTicketItem item = kdsService.bumpItem(itemId);
        return ResponseEntity.ok(kdsMapper.toItemResponse(item));
    }

    @PostMapping("/items/{itemId}/serve")
    public ResponseEntity<KDSTicketItemResponse> serveItem(@PathVariable UUID itemId) {
        KDSTicketItem item = kdsService.serveItem(itemId);
        return ResponseEntity.ok(kdsMapper.toItemResponse(item));
    }

    @PostMapping("/tickets/{ticketId}/bump")
    public ResponseEntity<KDSTicketResponse> bumpTicket(@PathVariable UUID ticketId) {
        KDSTicket ticket = kdsService.bumpTicket(ticketId);
        List<KDSTicketItemResponse> items = ticketItemRepository.findByKdsTicket_Id(ticket.getId()).stream()
                .map(kdsMapper::toItemResponse).toList();
        return ResponseEntity.ok(kdsMapper.toResponse(ticket, items));
    }

    @PostMapping("/tickets/{ticketId}/start")
    public ResponseEntity<KDSTicketResponse> startTicket(@PathVariable UUID ticketId) {
        KDSTicket ticket = kdsService.startCookingTicket(ticketId);
        List<KDSTicketItemResponse> items = ticketItemRepository.findByKdsTicket_Id(ticket.getId()).stream()
                .map(kdsMapper::toItemResponse).toList();
        return ResponseEntity.ok(kdsMapper.toResponse(ticket, items));
    }

    @PostMapping("/items/{itemId}/priority")
    public ResponseEntity<KDSTicketItemResponse> updatePriority(@PathVariable UUID itemId, @RequestParam int priority) {
        KDSTicketItem item = kdsService.updateItemPriority(itemId, priority);
        return ResponseEntity.ok(kdsMapper.toItemResponse(item));
    }

    @PostMapping("/items/{itemId}/toggle")
    public ResponseEntity<KDSTicketItemResponse> toggleItem(@PathVariable UUID itemId) {
        KDSTicketItem item = kdsService.toggleItemStatus(itemId);
        return ResponseEntity.ok(kdsMapper.toItemResponse(item));
    }

    @PostMapping("/items/{itemId}/ready")
    public ResponseEntity<KDSTicketItemResponse> markItemReady(@PathVariable UUID itemId) {
        KDSTicketItem item = kdsService.markItemReady(itemId);
        return ResponseEntity.ok(kdsMapper.toItemResponse(item));
    }

    @PostMapping(value = "/tickets/serve-ready", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> serveReadyItems(@RequestBody List<UUID> ticketIds) {
        kdsService.serveReadyItemsInTickets(ticketIds);
        return ResponseEntity.ok().build();
    }
}
