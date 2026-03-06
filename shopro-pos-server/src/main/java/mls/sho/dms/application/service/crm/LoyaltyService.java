package mls.sho.dms.application.service.crm;

import mls.sho.dms.entity.order.OrderTicket;

import java.math.BigDecimal;
import java.util.UUID;

public interface LoyaltyService {
    void processOrderPoints(OrderTicket ticket);
    void redeemPoints(UUID customerId, int points, UUID orderId);
    BigDecimal calculateDiscount(int points);
}
