package mls.sho.dms.application.service.impl.crm;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.crm.*;
import mls.sho.dms.application.exception.BusinessRuleException;
import mls.sho.dms.application.exception.ResourceNotFoundException;
import mls.sho.dms.application.service.crm.LoyaltyService;
import mls.sho.dms.entity.crm.*;
import mls.sho.dms.repository.crm.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoyaltyServiceImpl implements LoyaltyService {

    private final LoyaltyConfigRepository configRepository;
    private final LoyaltyTierRepository tierRepository;
    private final CustomerProfileRepository customerRepository;
    private final LoyaltyTransactionRepository transactionRepository;
    private final BonusPointEventRepository bonusEventRepository;

    @Override
    public LoyaltyConfigResponse getConfig() {
        LoyaltyConfig config = getOrCreateConfig();
        return mapToConfigResponse(config);
    }

    @Override
    @Transactional
    public LoyaltyConfigResponse updateConfig(UpdateLoyaltyConfigRequest request) {
        LoyaltyConfig config = getOrCreateConfig();
        config.setEarningRate(request.earningRate());
        config.setRedemptionValue(request.redemptionValue());
        config.setMinimumRedemptionPoints(request.minimumRedemptionPoints());
        config.setPointExpirationDays(request.pointExpirationDays());
        
        config.setDefaultSmsOptIn(request.defaultSmsOptIn());
        config.setDefaultEmailOptIn(request.defaultEmailOptIn());
        config.setFeedbackWindowHours(request.feedbackWindowHours());
        config.setSmsGatewayEnabled(request.smsGatewayEnabled());
        config.setEmailGatewayEnabled(request.emailGatewayEnabled());
        
        return mapToConfigResponse(configRepository.save(config));
    }

    @Override
    public List<LoyaltyTierResponse> getTiers() {
        return tierRepository.findAllByOrderBySpendThresholdAsc().stream()
                .map(this::mapToTierResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LoyaltyTierResponse createTier(CreateLoyaltyTierRequest request) {
        if (tierRepository.findByName(request.name().toUpperCase()).isPresent()) {
            throw new BusinessRuleException("Tier with this name already exists");
        }
        LoyaltyTier tier = new LoyaltyTier();
        tier.setName(request.name().toUpperCase());
        tier.setSpendThreshold(request.spendThreshold());
        tier.setPointMultiplier(request.pointMultiplier());
        return mapToTierResponse(tierRepository.save(tier));
    }

    @Override
    @Transactional
    public LoyaltyTierResponse updateTier(UUID id, UpdateLoyaltyTierRequest request) {
        LoyaltyTier tier = tierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tier not found"));
        
        Optional<LoyaltyTier> existingCode = tierRepository.findByName(request.name().toUpperCase());
        if (existingCode.isPresent() && !existingCode.get().getId().equals(id)) {
            throw new BusinessRuleException("Tier with this name already exists");
        }

        tier.setName(request.name().toUpperCase());
        tier.setSpendThreshold(request.spendThreshold());
        tier.setPointMultiplier(request.pointMultiplier());
        return mapToTierResponse(tierRepository.save(tier));
    }

    @Override
    @Transactional
    public void deleteTier(UUID id) {
        tierRepository.deleteById(id);
    }

    @Override
    public LoyaltyBalanceResponse getBalance(UUID customerId) {
        CustomerProfile customer = getCustomer(customerId);
        LoyaltyTier tier = customer.getLoyaltyTier();
        
        // Find next tier if applicable
        List<LoyaltyTier> allTiers = tierRepository.findAllByOrderBySpendThresholdAsc();
        BigDecimal nextThreshold = null;
        BigDecimal spendToNext = null;

        if (tier != null) {
            for (LoyaltyTier t : allTiers) {
                if (t.getSpendThreshold().compareTo(tier.getSpendThreshold()) > 0) {
                    nextThreshold = t.getSpendThreshold();
                    spendToNext = t.getSpendThreshold().subtract(customer.getLifetimeSpend());
                    break;
                }
            }
        }

        return new LoyaltyBalanceResponse(
                customer.getId(),
                customer.getAvailablePoints(),
                customer.getLifetimeSpend(),
                tier != null ? tier.getName() : "NONE",
                tier != null ? tier.getPointMultiplier() : BigDecimal.ONE,
                nextThreshold,
                spendToNext != null && spendToNext.compareTo(BigDecimal.ZERO) > 0 ? spendToNext : null
        );
    }

    @Override
    @Transactional
    public void earnPoints(UUID customerId, BigDecimal spendAmount, UUID orderTicketId) {
        if (spendAmount.compareTo(BigDecimal.ZERO) <= 0) return;

        CustomerProfile customer = getCustomer(customerId);
        LoyaltyConfig config = getOrCreateConfig();
        
        BigDecimal multiplier = customer.getLoyaltyTier() != null 
                ? customer.getLoyaltyTier().getPointMultiplier() 
                : BigDecimal.ONE;
        
        BigDecimal basePoints = spendAmount.multiply(config.getEarningRate()).multiply(multiplier);
        int finalPoints = basePoints.setScale(0, RoundingMode.HALF_UP).intValue();

        List<BonusPointEvent> activeEvents = bonusEventRepository.findActiveEventsAtTime(Instant.now());
        BonusPointEvent appliedEvent = null;
        
        for (BonusPointEvent event : activeEvents) {
            if (event.getScope() == BonusPointEventScope.ALL) {
                finalPoints = new BigDecimal(finalPoints).multiply(event.getMultiplier()).setScale(0, RoundingMode.HALF_UP).intValue();
                appliedEvent = event;
                break;
            }
        }

        if (finalPoints <= 0) return;

        customer.setAvailablePoints(customer.getAvailablePoints() + finalPoints);
        customer.setLifetimeSpend(customer.getLifetimeSpend().add(spendAmount));
        
        autoUpgradeTier(customer);

        LoyaltyTransaction tx = new LoyaltyTransaction();
        tx.setCustomerProfile(customer);
        tx.setPoints(finalPoints);
        tx.setDescription("Earned points from purchase");
        tx.setTransactionType(appliedEvent != null ? LoyaltyTransactionType.BONUS : LoyaltyTransactionType.EARN);
        tx.setBonusEvent(appliedEvent);
        
        transactionRepository.save(tx);
        customerRepository.save(customer);
    }

    @Override
    @Transactional
    public RedeemPointsResponse redeemPoints(UUID customerId, RedeemPointsRequest request) {
        CustomerProfile customer = getCustomer(customerId);
        LoyaltyConfig config = getOrCreateConfig();

        if (request.pointsToRedeem() < config.getMinimumRedemptionPoints()) {
            throw new BusinessRuleException("Cannot redeem less than " + config.getMinimumRedemptionPoints() + " points");
        }

        if (customer.getAvailablePoints() < request.pointsToRedeem()) {
            throw new BusinessRuleException("Insufficient points balance");
        }

        BigDecimal redValue = new BigDecimal(request.pointsToRedeem()).multiply(config.getRedemptionValue());

        customer.setAvailablePoints(customer.getAvailablePoints() - request.pointsToRedeem());
        
        LoyaltyTransaction tx = new LoyaltyTransaction();
        tx.setCustomerProfile(customer);
        tx.setPoints(-request.pointsToRedeem());
        tx.setDescription("Redeemed points");
        tx.setTransactionType(LoyaltyTransactionType.REDEEM);
        
        transactionRepository.save(tx);
        customerRepository.save(customer);

        return new RedeemPointsResponse(true, request.pointsToRedeem(), redValue, customer.getAvailablePoints());
    }

    @Override
    public List<LoyaltyTransactionResponse> getTransactionHistory(UUID customerId) {
        return transactionRepository.findByCustomerProfileIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapToTransactionResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BonusEventResponse> getActiveBonusEvents() {
        return bonusEventRepository.findActiveEventsAtTime(Instant.now()).stream()
                .map(this::mapToBonusEventResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BonusEventResponse createBonusEvent(CreateBonusEventRequest request) {
        if (request.endsAt().isBefore(request.startsAt())) {
            throw new BusinessRuleException("End time must be after start time");
        }
        
        BonusPointEvent event = new BonusPointEvent();
        event.setName(request.name());
        event.setMultiplier(request.multiplier());
        event.setScope(request.scope());
        event.setScopeReferenceId(request.scopeReferenceId());
        event.setStartsAt(request.startsAt());
        event.setEndsAt(request.endsAt());
        event.setActive(true);
        
        return mapToBonusEventResponse(bonusEventRepository.save(event));
    }

    @Override
    @Transactional
    public void deleteBonusEvent(UUID id) {
        bonusEventRepository.deleteById(id);
    }

    private LoyaltyConfig getOrCreateConfig() {
        return configRepository.findFirstByOrderByCreatedAtAsc()
                .orElseGet(() -> {
                    LoyaltyConfig config = new LoyaltyConfig();
                    return configRepository.save(config);
                });
    }

    private CustomerProfile getCustomer(UUID customerId) {
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    }

    private void autoUpgradeTier(CustomerProfile customer) {
        tierRepository.findTopBySpendThresholdLessThanEqualOrderBySpendThresholdDesc(customer.getLifetimeSpend())
                .ifPresent(tier -> {
                    if (customer.getLoyaltyTier() == null || 
                        customer.getLoyaltyTier().getSpendThreshold().compareTo(tier.getSpendThreshold()) < 0) {
                        customer.setLoyaltyTier(tier);
                    }
                });
    }

    private LoyaltyConfigResponse mapToConfigResponse(LoyaltyConfig config) {
        return new LoyaltyConfigResponse(
                config.getId(), config.getEarningRate(), config.getRedemptionValue(),
                config.getMinimumRedemptionPoints(), config.getPointExpirationDays(),
                config.isDefaultSmsOptIn(), config.isDefaultEmailOptIn(),
                config.getFeedbackWindowHours(), config.isSmsGatewayEnabled(),
                config.isEmailGatewayEnabled()
        );
    }

    private LoyaltyTierResponse mapToTierResponse(LoyaltyTier tier) {
        return new LoyaltyTierResponse(tier.getId(), tier.getName(), tier.getSpendThreshold(), tier.getPointMultiplier());
    }

    private LoyaltyTransactionResponse mapToTransactionResponse(LoyaltyTransaction tx) {
        return new LoyaltyTransactionResponse(
                tx.getId(), tx.getPoints(), tx.getDescription(), tx.getTransactionType(),
                tx.getOrderTicket() != null ? tx.getOrderTicket().getId() : null,
                tx.getBonusEvent() != null ? tx.getBonusEvent().getId() : null,
                tx.getCreatedAt()
        );
    }

    private BonusEventResponse mapToBonusEventResponse(BonusPointEvent event) {
        return new BonusEventResponse(
                event.getId(), event.getName(), event.getMultiplier(), event.getScope(),
                event.getScopeReferenceId(), event.getStartsAt(), event.getEndsAt(), event.isActive()
        );
    }
}
