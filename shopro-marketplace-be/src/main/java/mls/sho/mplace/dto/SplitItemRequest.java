package mls.sho.mplace.dto;

import java.util.UUID;

public record SplitItemRequest(
    UUID orderItemId,
    UUID supplierId
) {}
