package mls.sho.dms.entity.users;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "guest_oauth_accounts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestOAuthAccount {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "oauth_id")
    private UUID oauthId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id", nullable = false)
    private Guest guest;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private OAuthProvider provider;
    
    @Column(name = "provider_subject", nullable = false)
    private String providerSubject;
    
    @Column(name = "provider_email")
    private String providerEmail;
    
    @Column(name = "provider_display_name")
    private String providerDisplayName;
    
    @Column(name = "provider_avatar_url")
    private String providerAvatarUrl;
    
    @Column(name = "access_token")
    private String accessToken;
    
    @Column(name = "refresh_token")
    private String refreshToken;
    
    @Column(name = "token_expires_at")
    private LocalDateTime tokenExpiresAt;
    
    @Column(name = "linked_at")
    private LocalDateTime linkedAt = LocalDateTime.now();
}