package mls.sho.dms.application.users.security;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.security.Principal;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class StaffPrincipal implements Principal {
    private final UUID staffId;
    private final String name;
    private final String role;
    private final Long restaurantId;  // Added for tenant isolation

    @Override
    public String getName() {
        return name;
    }
}
