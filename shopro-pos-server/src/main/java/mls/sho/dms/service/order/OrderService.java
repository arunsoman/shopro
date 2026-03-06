package mls.sho.dms.service.order;

import mls.sho.dms.dto.order.OrderTicketCreateRequest;
import mls.sho.dms.dto.order.OrderTicketDto;

import java.util.UUID;

public interface OrderService {
    
    OrderTicketDto createTicket(OrderTicketCreateRequest request);
    
    OrderTicketDto getTicket(UUID ticketId);
    
    OrderTicketDto sendToKitchen(UUID ticketId);
    
    OrderTicketDto applyDiscount(UUID ticketId, String managerPin, java.math.BigDecimal discountAmount);
    
    OrderTicketDto checkout(UUID ticketId, String paymentMethodId);
    
    void calculateTotals(UUID ticketId);
}
