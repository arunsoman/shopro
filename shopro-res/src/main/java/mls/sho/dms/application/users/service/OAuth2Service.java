package mls.sho.dms.application.users.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import mls.sho.dms.entity.users.OAuthProvider;
import mls.sho.dms.application.users.exception.OAuthException;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Slf4j
public class OAuth2Service {
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Value("${oauth.google.client-id}")
    private String googleClientId;
    
    @Value("${oauth.google.client-secret}")
    private String googleClientSecret;
    
    @Value("${oauth.facebook.client-id}")
    private String facebookClientId;
    
    @Value("${oauth.facebook.client-secret}")
    private String facebookClientSecret;
    
    @Value("${oauth.x.client-id}")
    private String xClientId;
    
    @Value("${oauth.x.client-secret}")
    private String xClientSecret;
    
    // ==================== AUTHORIZATION URLS ====================
    
    public String generateAuthorizationUrl(OAuthProvider provider, String redirectUri, String state) {
        return switch (provider) {
            case GOOGLE -> buildGoogleAuthUrl(redirectUri, state);
            case FACEBOOK -> buildFacebookAuthUrl(redirectUri, state);
            case X -> buildXAuthUrl(redirectUri, state);
            default -> throw new IllegalArgumentException("Unsupported provider: " + provider);
        };
    }
    
    private String buildGoogleAuthUrl(String redirectUri, String state) {
        return "https://accounts.google.com/o/oauth2/v2/auth?" +
            "client_id=" + googleClientId +
            "&redirect_uri=" + encode(redirectUri) +
            "&response_type=code" +
            "&scope=openid%20email%20profile" +
            "&state=" + state +
            "&access_type=offline" +
            "&prompt=consent";
    }
    
    private String buildFacebookAuthUrl(String redirectUri, String state) {
        return "https://www.facebook.com/v18.0/dialog/oauth?" +
            "client_id=" + facebookClientId +
            "&redirect_uri=" + encode(redirectUri) +
            "&state=" + state +
            "&scope=email,public_profile";
    }
    
    private String buildXAuthUrl(String redirectUri, String state) {
        // X uses OAuth 1.0a or OAuth 2.0 PKCE - this is OAuth 2.0
        return "https://twitter.com/i/oauth2/authorize?" +
            "client_id=" + xClientId +
            "&redirect_uri=" + encode(redirectUri) +
            "&response_type=code" +
            "&scope=tweet.read%20users.read" +
            "&state=" + state +
            "&code_challenge=challenge" +  // PKCE - generate properly in production
            "&code_challenge_method=plain";
    }
    
    // ==================== TOKEN EXCHANGE ====================
    
    public OAuthUserInfo fetchUserInfo(OAuthProvider provider, String code, String redirectUri) {
        TokenResponse tokens = exchangeCodeForTokens(provider, code, redirectUri);
        return fetchUserInfoFromProvider(provider, tokens.getAccessToken());
    }
    
    private TokenResponse exchangeCodeForTokens(OAuthProvider provider, String code, String redirectUri) {
        return switch (provider) {
            case GOOGLE -> exchangeGoogleCode(code, redirectUri);
            case FACEBOOK -> exchangeFacebookCode(code, redirectUri);
            case X -> exchangeXCode(code, redirectUri);
            default -> throw new IllegalArgumentException("Unsupported provider: " + provider);
        };
    }
    
    private TokenResponse exchangeGoogleCode(String code, String redirectUri) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("code", code);
        params.add("redirect_uri", redirectUri);
        params.add("client_id", googleClientId);
        params.add("client_secret", googleClientSecret);
        
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        
        ResponseEntity<JsonNode> response = restTemplate.postForEntity(
            "https://oauth2.googleapis.com/token",
            request,
            JsonNode.class
        );
        
        JsonNode body = response.getBody();
        if (body == null || body.has("error")) {
            throw new OAuthException("Failed to exchange Google code: " + 
                (body != null ? body.get("error").asText() : "Empty response"));
        }
        
        return TokenResponse.builder()
            .accessToken(body.get("access_token").asText())
            .refreshToken(body.has("refresh_token") ? body.get("refresh_token").asText() : null)
            .expiresIn(body.has("expires_in") ? body.get("expires_in").asInt() : 3600)
            .build();
    }
    
    private TokenResponse exchangeFacebookCode(String code, String redirectUri) {
        String url = "https://graph.facebook.com/v18.0/oauth/access_token?" +
            "client_id=" + facebookClientId +
            "&client_secret=" + facebookClientSecret +
            "&code=" + code +
            "&redirect_uri=" + encode(redirectUri);
        
        ResponseEntity<JsonNode> response = restTemplate.getForEntity(url, JsonNode.class);
        
        JsonNode body = response.getBody();
        if (body == null || body.has("error")) {
            throw new OAuthException("Failed to exchange Facebook code");
        }
        
        return TokenResponse.builder()
            .accessToken(body.get("access_token").asText())
            .expiresIn(body.has("expires_in") ? body.get("expires_in").asInt() : 3600)
            .build();
    }
    
    private TokenResponse exchangeXCode(String code, String redirectUri) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        // X uses Basic Auth with client credentials
        String credentials = Base64.getEncoder().encodeToString(
            (xClientId + ":" + xClientSecret).getBytes()
        );
        headers.set("Authorization", "Basic " + credentials);
        
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("code", code);
        params.add("redirect_uri", redirectUri);
        params.add("code_verifier", "challenge");  // PKCE verifier - match challenge
        
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        
        ResponseEntity<JsonNode> response = restTemplate.postForEntity(
            "https://api.twitter.com/2/oauth2/token",
            request,
            JsonNode.class
        );
        
        JsonNode body = response.getBody();
        if (body == null || body.has("error")) {
            throw new OAuthException("Failed to exchange X code");
        }
        
        return TokenResponse.builder()
            .accessToken(body.get("access_token").asText())
            .refreshToken(body.has("refresh_token") ? body.get("refresh_token").asText() : null)
            .expiresIn(body.has("expires_in") ? body.get("expires_in").asInt() : 7200)
            .build();
    }
    
    // ==================== USER INFO FETCHING ====================
    
    private OAuthUserInfo fetchUserInfoFromProvider(OAuthProvider provider, String accessToken) {
        return switch (provider) {
            case GOOGLE -> fetchGoogleUserInfo(accessToken);
            case FACEBOOK -> fetchFacebookUserInfo(accessToken);
            case X -> fetchXUserInfo(accessToken);
            default -> throw new IllegalArgumentException("Unsupported provider: " + provider);
        };
    }
    
    private OAuthUserInfo fetchGoogleUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<Void> request = new HttpEntity<>(headers);
        
        ResponseEntity<JsonNode> response = restTemplate.exchange(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            HttpMethod.GET,
            request,
            JsonNode.class
        );
        
        JsonNode body = response.getBody();
        if (body == null) throw new OAuthException("Empty response from Google");
        
        return OAuthUserInfo.builder()
            .subject(body.get("sub").asText())
            .email(body.get("email").asText())
            .name(body.has("name") ? body.get("name").asText() : body.get("email").asText())
            .picture(body.has("picture") ? body.get("picture").asText() : null)
            .provider(OAuthProvider.GOOGLE)
            .accessToken(accessToken)
            .build();
    }
    
    private OAuthUserInfo fetchFacebookUserInfo(String accessToken) {
        String url = "https://graph.facebook.com/me?fields=id,name,email,picture&access_token=" + accessToken;
        
        ResponseEntity<JsonNode> response = restTemplate.getForEntity(url, JsonNode.class);
        JsonNode body = response.getBody();
        if (body == null) throw new OAuthException("Empty response from Facebook");
        
        String pictureUrl = null;
        if (body.has("picture") && body.get("picture").has("data")) {
            pictureUrl = body.get("picture").get("data").get("url").asText();
        }
        
        return OAuthUserInfo.builder()
            .subject(body.get("id").asText())
            .email(body.get("email").asText())
            .name(body.get("name").asText())
            .picture(pictureUrl)
            .provider(OAuthProvider.FACEBOOK)
            .accessToken(accessToken)
            .build();
    }
    
    private OAuthUserInfo fetchXUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<Void> request = new HttpEntity<>(headers);
        
        ResponseEntity<JsonNode> response = restTemplate.exchange(
            "https://api.twitter.com/2/users/me?user.fields=profile_image_url",
            HttpMethod.GET,
            request,
            JsonNode.class
        );
        
        JsonNode body = response.getBody();
        if (body == null || !body.has("data")) throw new OAuthException("Empty response from X");
        
        JsonNode user = body.get("data");
        
        return OAuthUserInfo.builder()
            .subject(user.get("id").asText())
            .email(null)  // X doesn't provide email in basic tier
            .name(user.get("name").asText())
            .picture(user.has("profile_image_url") ? user.get("profile_image_url").asText() : null)
            .provider(OAuthProvider.X)
            .accessToken(accessToken)
            .build();
    }
    
    // ==================== TOKEN REFRESH ====================
    
    public TokenResponse refreshAccessToken(OAuthProvider provider, String refreshToken) {
        return switch (provider) {
            case GOOGLE -> refreshGoogleToken(refreshToken);
            case FACEBOOK -> {
                // Facebook long-lived tokens use different flow
                throw new UnsupportedOperationException("Facebook token refresh not implemented");
            }
            case X -> refreshXToken(refreshToken);
            default -> throw new IllegalArgumentException("Unsupported provider: " + provider);
        };
    }
    
    private TokenResponse refreshGoogleToken(String refreshToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "refresh_token");
        params.add("refresh_token", refreshToken);
        params.add("client_id", googleClientId);
        params.add("client_secret", googleClientSecret);
        
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        
        ResponseEntity<JsonNode> response = restTemplate.postForEntity(
            "https://oauth2.googleapis.com/token",
            request,
            JsonNode.class
        );
        
        JsonNode body = response.getBody();
        if (body == null || body.has("error")) {
            throw new OAuthException("Failed to refresh Google token");
        }
        
        return TokenResponse.builder()
            .accessToken(body.get("access_token").asText())
            .expiresIn(body.has("expires_in") ? body.get("expires_in").asInt() : 3600)
            .build();
    }
    
    private TokenResponse refreshXToken(String refreshToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        String credentials = Base64.getEncoder().encodeToString(
            (xClientId + ":" + xClientSecret).getBytes()
        );
        headers.set("Authorization", "Basic " + credentials);
        
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "refresh_token");
        params.add("refresh_token", refreshToken);
        
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        
        ResponseEntity<JsonNode> response = restTemplate.postForEntity(
            "https://api.twitter.com/2/oauth2/token",
            request,
            JsonNode.class
        );
        
        JsonNode body = response.getBody();
        if (body == null || body.has("error")) {
            throw new OAuthException("Failed to refresh X token");
        }
        
        return TokenResponse.builder()
            .accessToken(body.get("access_token").asText())
            .refreshToken(body.has("refresh_token") ? body.get("refresh_token").asText() : null)
            .expiresIn(body.has("expires_in") ? body.get("expires_in").asInt() : 7200)
            .build();
    }
    
    // ==================== UTILITIES ====================
    
    private String encode(String value) {
        return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
    }
    
    // ==================== DTOs ====================
    
    @Data
    @Builder
    public static class TokenResponse {
        private String accessToken;
        private String refreshToken;
        private Integer expiresIn;
        
        public LocalDateTime getExpiresAt() {
            return LocalDateTime.ofInstant(
                Instant.now().plusSeconds(expiresIn != null ? expiresIn : 3600),
                ZoneId.systemDefault()
            );
        }
    }
    
    @Data
    @Builder
    public static class OAuthUserInfo {
        private String subject;          // Provider's unique user ID
        private String email;
        private String name;
        private String picture;
        private OAuthProvider provider;
        private String accessToken;
        private String refreshToken;
        private LocalDateTime expiresAt;
    }
}