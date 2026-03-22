package mls.sho.mplace.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record CreateBidRequest(
    String title,
    String description,
    UUID categoryId,
    LocalDateTime deadline,
    String urgency,
    List<BidItemRequest> items
) {
    public record BidItemRequest(
        String productName,
        Double quantity,
        String unit
    ) {}
}
