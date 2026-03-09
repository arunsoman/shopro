package mls.sho.dms.application.service.crm;

import mls.sho.dms.application.dto.crm.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface LoyaltyService {
    // Config
    LoyaltyConfigResponse getConfig();
    LoyaltyConfigResponse updateConfig(UpdateLoyaltyConfigRequest request);

    // Tiers
    List<LoyaltyTierResponse> getTiers();
    LoyaltyTierResponse createTier(CreateLoyaltyTierRequest request);
    LoyaltyTierResponse updateTier(UUID id, UpdateLoyaltyTierRequest request);
    void deleteTier(UUID id);

    // Points & Transactions
    LoyaltyBalanceResponse getBalance(UUID customerId);
    void earnPoints(UUID customerId, BigDecimal spendAmount, UUID orderTicketId);
    RedeemPointsResponse redeemPoints(UUID customerId, RedeemPointsRequest request);
    List<LoyaltyTransactionResponse> getTransactionHistory(UUID customerId);

    // Bonus Events
    List<BonusEventResponse> getActiveBonusEvents();
    BonusEventResponse createBonusEvent(CreateBonusEventRequest request);
    void deleteBonusEvent(UUID id);
}
