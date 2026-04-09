package mls.sho.dms.entity.users;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;
import io.hypersistence.utils.hibernate.type.json.JsonType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "guests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Guest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "guest_id")
    private UUID guestId;
    
    private String email;
    
    @Column(name = "password_hash")
    private String passwordHash;
    
    @Column(name = "display_name")
    private String displayName;
    
    private String phone;
    
    @Column(name = "avatar_url")
    private String avatarUrl;
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    @Column(name = "is_oauth_only")
    private Boolean isOauthOnly = false;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private List<String> dietaryRestrictions = new ArrayList<>();
    
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private List<String> allergies = new ArrayList<>();
    
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private List<String> favoriteCuisines = new ArrayList<>();
    
    @Column(name = "loyalty_points")
    private Integer loyaltyPoints = 0;
    
    @Column(name = "loyalty_tier")
    @Enumerated(EnumType.STRING)
    private LoyaltyTier loyaltyTier = LoyaltyTier.BRONZE;
    
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;
    
    @Column(name = "last_login_ip")
    private String lastLoginIp;
    
    @Column(name = "is_verified")
    private Boolean isVerified = false;
    
    @Column(name = "verification_token")
    private String verificationToken;
    
    @Column(name = "verification_expires_at")
    private LocalDateTime verificationExpiresAt;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @OneToMany(mappedBy = "guest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<GuestOAuthAccount> oauthAccounts = new ArrayList<>();
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public boolean hasLocalAuth() {
        return email != null && passwordHash != null;
    }
    
    public boolean hasOAuth() {
        return oauthAccounts != null && !oauthAccounts.isEmpty();
    }
    
    public void addLoyaltyPoints(int points) {
        this.loyaltyPoints += points;
        updateTier();
    }
    
    private void updateTier() {
        if (loyaltyPoints >= 10000) loyaltyTier = LoyaltyTier.PLATINUM;
        else if (loyaltyPoints >= 5000) loyaltyTier = LoyaltyTier.GOLD;
        else if (loyaltyPoints >= 1000) loyaltyTier = LoyaltyTier.SILVER;
        else loyaltyTier = LoyaltyTier.BRONZE;
    }
}