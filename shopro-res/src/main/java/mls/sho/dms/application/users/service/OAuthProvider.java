package mls.sho.dms.application.users.service;

import lombok.Getter;

@Getter
public enum OAuthProvider {
    GOOGLE("Google", "https://www.googleapis.com/oauth2/v3/userinfo"),
    FACEBOOK("Facebook", "https://graph.facebook.com/me"),
    X("X", "https://api.twitter.com/2/users/me"),
    APPLE("Apple", null),
    GITHUB("GitHub", "https://api.github.com/user"),
    MICROSOFT("Microsoft", "https://graph.microsoft.com/v1.0/me");
    
    private final String displayName;
    private final String userInfoUrl;
    
    OAuthProvider(String displayName, String userInfoUrl) {
        this.displayName = displayName;
        this.userInfoUrl = userInfoUrl;
    }
}