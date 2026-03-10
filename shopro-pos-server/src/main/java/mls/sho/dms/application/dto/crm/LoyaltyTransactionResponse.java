package mls.sho.dms.application.dto.crm;

import mls.sho.dms.entity.crm.LoyaltyTransactionType;
import java.time.Instant;
import java.util.UUID;

public record LoyaltyTransactionResponse(
    UUID id,
    int points,
    String description,
    LoyaltyTransactionType transactionType,
    UUID orderTicketId,
    UUID bonusEventId,
    Instant createdAt
) {}
