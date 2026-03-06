package mls.sho.dms.application.service.impl.crm;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.service.crm.LoyaltyService;
import mls.sho.dms.entity.crm.CustomerProfile;
import mls.sho.dms.entity.crm.LoyaltyTier;
import mls.sho.dms.entity.crm.LoyaltyTransaction;
import mls.sho.dms.entity.order.OrderTicket;
import mls.sho.dms.application.exception.BusinessRuleException;
import mls.sho.dms.repository.crm.CustomerProfileRepository;
import mls.sho.dms.repository.crm.LoyaltyTierRepository;
import mls.sho.dms.repository.crm.LoyaltyTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LoyaltyServiceImpl implements LoyaltyService {

    private final CustomerProfileRepository customerRepository;
    private final LoyaltyTierRepository tierRepository;
    private final LoyaltyTransactionRepository transactionRepository;

    @Override
    @Transactional
    public void processOrderPoints(OrderTicket ticket) {
        if (ticket.getCustomerProfile() == null) return;

        CustomerProfile customer = ticket.getCustomerProfile();

        BigDecimal multiplier = customer.getLoyaltyTier().getPointMultiplier();
        int pointsEarned = ticket.getTotalAmount().multiply(multiplier).setScale(0, RoundingMode.FLOOR).intValue();

        if (pointsEarned > 0) {
            // Update customer balance
            customer.setAvailablePoints(customer.getAvailablePoints() + pointsEarned);
            customer.setLifetimeSpend(customer.getLifetimeSpend().add(ticket.getTotalAmount()));

            // Audit transaction
            LoyaltyTransaction tx = new LoyaltyTransaction();
            tx.setCustomerProfile(customer);
            tx.setOrderTicket(ticket);
            tx.setPoints(pointsEarned);
            tx.setDescription("Points earned for order #" + ticket.getId().toString().substring(0, 8));
            transactionRepository.save(tx);

            // Re-evaluate tier
            evaluateTierPromotion(customer);
            customerRepository.save(customer);
        }
    }

    private void evaluateTierPromotion(CustomerProfile customer) {
        List<LoyaltyTier> allTiers = tierRepository.findAll();
        // Find highest tier where spend threshold is met
        allTiers.stream()
                .filter(t -> customer.getLifetimeSpend().compareTo(t.getSpendThreshold()) >= 0)
                .max(Comparator.comparing(LoyaltyTier::getSpendThreshold))
                .ifPresent(customer::setLoyaltyTier);
    }

    @Override
    @Transactional
    public void redeemPoints(UUID customerId, int points, UUID orderId) {
        CustomerProfile customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new BusinessRuleException("Customer not found"));

        if (customer.getAvailablePoints() < points) {
            throw new BusinessRuleException("Insufficient points balance");
        }

        customer.setAvailablePoints(customer.getAvailablePoints() - points);
        
        LoyaltyTransaction tx = new LoyaltyTransaction();
        tx.setCustomerProfile(customer);
        tx.setPoints(-points);
        tx.setDescription("Points redeemed for order #" + orderId.toString().substring(0, 8));
        transactionRepository.save(tx);
        
        customerRepository.save(customer);
    }

    @Override
    public BigDecimal calculateDiscount(int points) {
        // Simple rule: 100 points = 1.00 AED discount
        return new BigDecimal(points).divide(new BigDecimal(100), 2, RoundingMode.HALF_UP);
    }
}
