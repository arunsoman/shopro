package mls.sho.dms.application.users.security;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.security.Principal;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class ShoProPrincipal implements Principal {
    private final UUID shoproId;
    private final String username;

    @Override
    public String getName() {
        return username;
    }
}
