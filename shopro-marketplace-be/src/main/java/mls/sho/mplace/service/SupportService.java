package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.SupportTicket;
import mls.sho.mplace.entity.TicketMessage;
import mls.sho.mplace.repository.SupportTicketRepository;
import mls.sho.mplace.repository.TicketMessageRepository;
import mls.sho.mplace.util.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupportService {

    private final SupportTicketRepository ticketRepository;
    private final TicketMessageRepository messageRepository;
    private final mls.sho.mplace.repository.RestaurantRepository restaurantRepository;
    private final mls.sho.mplace.repository.SupplierRepository supplierRepository;
    private final SecurityUtils securityUtils;

    public List<SupportTicket> getMyTickets() {
        var requester = securityUtils.getCurrentRequester();
        if (requester == null) return Collections.emptyList();

        if (requester.isBuyer()) {
            return ticketRepository.findAllByRestaurant_Id(requester.restaurantId());
        } else if (requester.isSupplier()) {
            return ticketRepository.findAllBySupplier_Id(requester.supplierId());
        } else {
            return ticketRepository.findAll();
        }
    }

    @Transactional
    public SupportTicket createTicket(SupportTicket ticket) {
        var requester = securityUtils.getCurrentRequester();
        if (requester != null) {
            if (requester.isBuyer()) {
                ticket.setRestaurant(restaurantRepository.findById(requester.restaurantId()).orElse(null));
            } else if (requester.isSupplier()) {
                ticket.setSupplier(supplierRepository.findById(requester.supplierId()).orElse(null));
            }
        }
        return ticketRepository.save(ticket);
    }

    @Transactional
    public TicketMessage addMessage(UUID ticketId, String body) {
        var requester = securityUtils.getCurrentRequester();
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        TicketMessage message = new TicketMessage();
        message.setTicket(ticket);
        message.setBody(body);
        message.setAuthor(requester != null ? requester.email() : "System");
        return messageRepository.save(message);
    }
}
