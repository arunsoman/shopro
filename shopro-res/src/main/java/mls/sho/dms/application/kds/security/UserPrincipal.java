package mls.sho.dms.application.kds.security;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.security.Principal;

/**
 * Custom principal for authenticated users (manager/expo/owner).
 */
@Getter
@AllArgsConstructor
public class UserPrincipal implements Principal {
    private final Long userId;
    private final String username;
    private final String role;

    @Override
    public String getName() {
        return username;
    }
}
