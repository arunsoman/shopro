package mls.sho.dms.dto.tableside;

import java.util.UUID;

public record TableQrResponse(
    UUID tableId,
    String tableName,
    String qrCodeBase64,
    String targetUrl
) {}
