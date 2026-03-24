package mls.sho.mplace.dto;

public record AuthResponse(String token, String refreshToken, String role) {}
