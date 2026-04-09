package mls.sho.dms.application.security;

import mls.sho.dms.entity.marketplace.MarketplaceUser;
import java.security.Principal;
import java.util.UUID;

public class MarketplaceUserPrincipal implements Principal {
    private final MarketplaceUser user;

    public MarketplaceUserPrincipal(MarketplaceUser user) {
        this.user = user;
    }

    @Override
    public String getName() {
        return user.getUsername();
    }

    public UUID getId() {
        return user.getId();
    }

    public String getRole() {
        return user.getRole() != null ? user.getRole().name() : "NONE";
    }

    public MarketplaceUser getUser() {
        return user;
    }

    public UUID getAssociatedEntityId() {
        return user.getAssociatedEntityId();
    }
}
