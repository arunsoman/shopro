package mls.sho.mplace.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record OrderAuditDto(
    UUID id,
    String referenceNumber,
    String restaurantName,
    String status,
    String displayStatus,
    String raisedAt,
    BigDecimal totalAmount,
    List<ActivityEntry> activities,
    List<LedgerEntry> ledger,
    List<AllocationEntry> allocations
) {
    public record ActivityEntry(
        String status,
        String description,
        String timestamp,
        boolean completed,
        boolean internal
    ) {}

    public record LedgerEntry(
        UUID id,
        String description,
        BigDecimal amount,
        String type,
        String status,
        String date
    ) {}

    public record AllocationEntry(
        UUID subOrderId,
        String supplierName,
        BigDecimal amount,
        String status,
        String routingStrategy,
        List<String> items
    ) {}
}
