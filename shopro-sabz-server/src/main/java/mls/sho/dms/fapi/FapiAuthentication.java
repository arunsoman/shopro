package mls.sho.dms.fapi;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import java.util.Collection;

public class FapiAuthentication extends AbstractAuthenticationToken {
    private final String subject;
    private final String clientId;
    private final String scope;

    public FapiAuthentication(String subject, String clientId, String scope,
                               Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.subject  = subject;
        this.clientId = clientId;
        this.scope    = scope;
        setAuthenticated(true);
    }

    @Override public Object getPrincipal()   { return subject;  }
    @Override public Object getCredentials() { return null;     }
    public String getClientId()              { return clientId; }
    public String getScope()                 { return scope;    }
}
