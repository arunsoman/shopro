package mls.sho.dms.application.dto.inventory;

import java.time.Instant;
import java.util.UUID;

public record SupplierDashboardResponse(
    int activeRfqCount,
    int pendingBidCount,
    int wonBidsLast30Days,
    double winRate,
    Instant lastSyncAt
) {}
