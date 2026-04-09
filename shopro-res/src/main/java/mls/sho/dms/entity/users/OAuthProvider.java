package mls.sho.dms.entity.users;

import lombok.Getter;

@Getter
public enum OAuthProvider {
    GOOGLE("Google", "https://www.googleapis.com/oauth2/v3/userinfo"),
    FACEBOOK("Facebook", "https://graph.facebook.com/me"),
    X("X", "https://api.twitter.com/2/users/me"),
    APPLE("Apple", null);  // Apple uses different flow
    
    private final String displayName;
    private final String userInfoUrl;
    
    OAuthProvider(String displayName, String userInfoUrl) {
        this.displayName = displayName;
        this.userInfoUrl = userInfoUrl;
    }
}