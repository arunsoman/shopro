package mls.sho.dms.application.users.service;

import mls.sho.dms.entity.users.Guest;
import mls.sho.dms.entity.users.ShoProUser;
import mls.sho.dms.entity.users.Staff;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class JwtService {
    
    @Value("${jwt.secret:8f43678e-5b1a-4d2c-8a1a-3e4b5c6d7e8f-extremely-long-secret-key-for-hmac-sha-256-signing-must-be-at-least-256-bits-long}")
    private String jwtSecret;
    
    @Value("${jwt.issuer:sho-pro}")
    private String issuer;
    
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }
    
    // ==================== STAFF TOKENS ====================
    
    public String generateStaffToken(Staff staff) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "STAFF");
        claims.put("restaurant_id", staff.getRestaurantId().toString());
        claims.put("role", staff.getRole().name());
        claims.put("permissions", staff.getPermissions());
        claims.put("can_take_orders", staff.getCanTakeOrders());
        claims.put("can_process_payments", staff.getCanProcessPayments());
        
        // Encode StaffDto contents
        Map<String, Object> staffDto = new HashMap<>();
        staffDto.put("staffId", staff.getStaffId().toString());
        staffDto.put("name", staff.getDisplayName());
        staffDto.put("role", staff.getRole().name());
        staffDto.put("shiftActive", staff.getShiftActive());
        claims.put("staff", staffDto);
        
        return buildToken(staff.getStaffId().toString(), claims, 8, ChronoUnit.HOURS);
    }
    
    public String generateStaffRefreshToken(Staff staff) {
        return buildToken(staff.getStaffId().toString(), Map.of("type", "STAFF_REFRESH"), 7, ChronoUnit.DAYS);
    }
    
    // ==================== SHOPRO TOKENS ====================
    
    public String generateShoProToken(ShoProUser user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "SHOPRO");
        claims.put("username", user.getUsername());
        claims.put("permissions", user.getPermissions());
        claims.put("mfa_verified", true);
        claims.put("is_super_admin", user.getIsSuperAdmin());
        
        return buildToken(user.getShoproId().toString(), claims, 1, ChronoUnit.HOURS);
    }
    
    public String generateShoProRefreshToken(ShoProUser user) {
        return buildToken(user.getShoproId().toString(), Map.of("type", "SHOPRO_REFRESH"), 7, ChronoUnit.DAYS);
    }
    
    public String generateMfaTempToken(ShoProUser user) {
        // Short-lived token for MFA verification step
        return buildToken(user.getShoproId().toString(), Map.of("type", "MFA_PENDING"), 5, ChronoUnit.MINUTES);
    }
    
    public String generatePasswordResetToken(ShoProUser user) {
        return buildToken(user.getShoproId().toString(), Map.of("type", "PWD_RESET"), 15, ChronoUnit.MINUTES);
    }
    
    // ==================== GUEST TOKENS ====================
    
    public String generateGuestToken(Guest guest) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "GUEST");
        claims.put("email", guest.getEmail());
        claims.put("loyalty_tier", guest.getLoyaltyTier().name());
        claims.put("has_oauth", guest.hasOAuth());
        
        return buildToken(guest.getGuestId().toString(), claims, 7, ChronoUnit.DAYS);
    }
    
    public String generateGuestRefreshToken(Guest guest) {
        return buildToken(guest.getGuestId().toString(), Map.of("type", "GUEST_REFRESH"), 30, ChronoUnit.DAYS);
    }
    
    // ==================== TOKEN UTILITIES ====================
    
    private String buildToken(String subject, Map<String, Object> claims, long amount, ChronoUnit unit) {
        return Jwts.builder()
            .setClaims(claims)
            .setSubject(subject)
            .setIssuer(issuer)
            .setIssuedAt(Date.from(Instant.now()))
            .setExpiration(Date.from(Instant.now().plus(amount, unit)))
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
    }
    
    public Claims parseToken(String token) {
        return Jwts.parser()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
    }
    
    public boolean isTokenValid(String token) {
        try {
            Claims claims = parseToken(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }
    
    public UUID extractUserId(String token) {
        Claims claims = parseToken(token);
        return UUID.fromString(claims.getSubject());
    }
    
    public String extractTokenType(String token) {
        Claims claims = parseToken(token);
        return claims.get("type", String.class);
    }
    
    public long getExpirationSeconds(String token) {
        Claims claims = parseToken(token);
        return (claims.getExpiration().getTime() - System.currentTimeMillis()) / 1000;
    }
}