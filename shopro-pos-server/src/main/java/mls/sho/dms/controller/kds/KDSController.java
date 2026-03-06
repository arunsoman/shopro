package mls.sho.dms.controller.kds;

import mls.sho.dms.application.dto.kds.KDSTicketItemResponse;
import mls.sho.dms.application.dto.kds.KDSTicketResponse;
import mls.sho.dms.application.mapper.KDSMapper;
import mls.sho.dms.entity.kds.KDSTicket;
import mls.sho.dms.entity.kds.KDSTicketItem;
import mls.sho.dms.repository.kds.KDSTicketItemRepository;
import mls.sho.dms.service.kds.KDSService;
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

    @PostMapping("/tickets/{ticketId}/bump")
    public ResponseEntity<KDSTicketResponse> bumpTicket(@PathVariable UUID ticketId) {
        KDSTicket ticket = kdsService.bumpTicket(ticketId);
        List<KDSTicketItemResponse> items = ticketItemRepository.findByKdsTicket_Id(ticket.getId()).stream()
                .map(kdsMapper::toItemResponse).toList();
        return ResponseEntity.ok(kdsMapper.toResponse(ticket, items));
    }
}
