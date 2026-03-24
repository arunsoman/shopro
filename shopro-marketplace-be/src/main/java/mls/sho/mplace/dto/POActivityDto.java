package mls.sho.mplace.dto;

public record POActivityDto(
    String status,
    String description,
    String timestamp,
    boolean completed,
    boolean internal
) {}
