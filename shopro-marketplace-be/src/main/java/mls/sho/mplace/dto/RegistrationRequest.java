package mls.sho.mplace.dto;

public record RegistrationRequest(
    String email,
    String password,
    String fullName,
    String organizationName,
    String portalType // BUYER or SUPPLIER
) {}
