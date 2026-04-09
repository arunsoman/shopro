package mls.sho.dms.application.service.crm;

import mls.sho.dms.application.dto.crm.*;
import mls.sho.dms.application.exception.BusinessRuleException;
import mls.sho.dms.application.service.impl.crm.LoyaltyServiceImpl;
import mls.sho.dms.entity.crm.*;
import mls.sho.dms.repository.crm.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoyaltyServiceImplTest {

    @Mock private LoyaltyConfigRepository configRepository;
    @Mock private LoyaltyTierRepository tierRepository;
    @Mock private CustomerProfileRepository customerRepository;
    @Mock private LoyaltyTransactionRepository transactionRepository;
    @Mock private BonusPointEventRepository bonusEventRepository;

    @InjectMocks
    private LoyaltyServiceImpl loyaltyService;

    private CustomerProfile mockProfile;
    private LoyaltyConfig mockConfig;

    @BeforeEach
    void setUp() {
        mockProfile = new CustomerProfile();
        mockProfile.setId(UUID.randomUUID());
        mockProfile.setAvailablePoints(500);
        mockProfile.setLifetimeSpend(new BigDecimal("100.00"));

        mockConfig = new LoyaltyConfig();
        mockConfig.setId(UUID.randomUUID());
        mockConfig.setEarningRate(new BigDecimal("1.00")); // 1 point per $1
        mockConfig.setRedemptionValue(new BigDecimal("0.01")); // 1 cent per point
        mockConfig.setMinimumRedemptionPoints(100);
    }

    @Test
    void earnPoints_BaseMultiplier_Success() {
        when(customerRepository.findById(mockProfile.getId())).thenReturn(Optional.of(mockProfile));
        when(configRepository.findFirstByOrderByCreatedAtAsc()).thenReturn(Optional.of(mockConfig));
        when(bonusEventRepository.findActiveEventsAtTime(any())).thenReturn(Collections.emptyList());

        LoyaltyTier goldTier = new LoyaltyTier();
        goldTier.setPointMultiplier(new BigDecimal("1.5"));
        mockProfile.setLoyaltyTier(goldTier);

        loyaltyService.earnPoints(mockProfile.getId(), new BigDecimal("10.00"), null);

        // 10 spend * 1.0 rate * 1.5 multiplier = 15 points
        assertEquals(515, mockProfile.getAvailablePoints());
        assertEquals(new BigDecimal("110.00"), mockProfile.getLifetimeSpend());
        
        verify(transactionRepository).save(any(LoyaltyTransaction.class));
        verify(customerRepository).save(mockProfile);
    }

    @Test
    void earnPoints_StackWithBonusEvent() {
        when(customerRepository.findById(mockProfile.getId())).thenReturn(Optional.of(mockProfile));
        when(configRepository.findFirstByOrderByCreatedAtAsc()).thenReturn(Optional.of(mockConfig));
        
        BonusPointEvent doublePointsEvent = new BonusPointEvent();
        doublePointsEvent.setMultiplier(new BigDecimal("2.0"));
        doublePointsEvent.setScope(BonusPointEventScope.ALL);
        when(bonusEventRepository.findActiveEventsAtTime(any())).thenReturn(List.of(doublePointsEvent));

        loyaltyService.earnPoints(mockProfile.getId(), new BigDecimal("10.00"), null);

        // 10 spend * 1.0 tier (no tier) * 2.0 event = 20 points
        assertEquals(520, mockProfile.getAvailablePoints());
    }

    @Test
    void redeemPoints_BelowMinimum_ThrowsException() {
        when(customerRepository.findById(mockProfile.getId())).thenReturn(Optional.of(mockProfile));
        when(configRepository.findFirstByOrderByCreatedAtAsc()).thenReturn(Optional.of(mockConfig));

        RedeemPointsRequest request = new RedeemPointsRequest(50, null); // min is 100
        assertThrows(BusinessRuleException.class, () -> loyaltyService.redeemPoints(mockProfile.getId(), request));
    }

    @Test
    void redeemPoints_InsufficientBalance_ThrowsException() {
        mockProfile.setAvailablePoints(50); // Want to redeem 100, have 50
        when(customerRepository.findById(mockProfile.getId())).thenReturn(Optional.of(mockProfile));
        when(configRepository.findFirstByOrderByCreatedAtAsc()).thenReturn(Optional.of(mockConfig));

        RedeemPointsRequest request = new RedeemPointsRequest(100, null);
        assertThrows(BusinessRuleException.class, () -> loyaltyService.redeemPoints(mockProfile.getId(), request));
    }

    @Test
    void redeemPoints_Success() {
        when(customerRepository.findById(mockProfile.getId())).thenReturn(Optional.of(mockProfile));
        when(configRepository.findFirstByOrderByCreatedAtAsc()).thenReturn(Optional.of(mockConfig));

        RedeemPointsRequest request = new RedeemPointsRequest(200, null);
        RedeemPointsResponse response = loyaltyService.redeemPoints(mockProfile.getId(), request);

        assertTrue(response.success());
        assertEquals(200, response.pointsRedeemed());
        assertEquals(new BigDecimal("2.00"), response.redemptionValue()); // 200 * 0.01
        assertEquals(300, response.remainingBalance()); // 500 - 200
        
        verify(transactionRepository).save(any(LoyaltyTransaction.class));
    }

    @Test
    void autoUpgradeTier_HigherThresholdReached_Upgrades() {
        when(customerRepository.findById(mockProfile.getId())).thenReturn(Optional.of(mockProfile));
        when(configRepository.findFirstByOrderByCreatedAtAsc()).thenReturn(Optional.of(mockConfig));
        when(bonusEventRepository.findActiveEventsAtTime(any())).thenReturn(Collections.emptyList());

        LoyaltyTier platinumTier = new LoyaltyTier();
        platinumTier.setSpendThreshold(new BigDecimal("150.00")); // They will cross this
        
        // Return platinum since they will have string 100+100=200 spend
        when(tierRepository.findTopBySpendThresholdLessThanEqualOrderBySpendThresholdDesc(new BigDecimal("200.00")))
            .thenReturn(Optional.of(platinumTier));

        loyaltyService.earnPoints(mockProfile.getId(), new BigDecimal("100.00"), null);

        assertEquals(platinumTier, mockProfile.getLoyaltyTier());
    }
}
