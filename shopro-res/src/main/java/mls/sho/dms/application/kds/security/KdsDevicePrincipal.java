package mls.sho.dms.application.kds.security;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.security.Principal;

/**
 * Custom principal for authenticated KDS devices.
 */
@Getter
@AllArgsConstructor
public class KdsDevicePrincipal implements Principal {
    private final Long deviceId;
    private final String name;

    @Override
    public String getName() {
        return name;
    }
}
