package mls.sho.dms.application.dto;

public record DuplicateCheckResponse(
    boolean exists,
    String categoryName
) {}
