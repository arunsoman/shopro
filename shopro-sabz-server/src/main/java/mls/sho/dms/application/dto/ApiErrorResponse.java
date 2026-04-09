package mls.sho.dms.application.dto;

public record ApiErrorResponse(
    int status,
    String message,
    String timestamp
) {}
