package mls.sho.dms.config.security;

import mls.sho.dms.entity.guest.GuestUser;
import mls.sho.dms.repository.guest.GuestUserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Customizes the JWT (IdToken) claims for FAPI 2.0 / OIDC flows.
 * Maps GuestUser metadata to standard OIDC claims.
 */
@Component
public class FapiGuestTokenCustomizer implements OAuth2TokenCustomizer<JwtEncodingContext> {

    private final GuestUserRepository guestUserRepository;

    public FapiGuestTokenCustomizer(GuestUserRepository guestUserRepository) {
        this.guestUserRepository = guestUserRepository;
    }

    @Override
    public void customize(JwtEncodingContext context) {
        if ("id_token".equals(context.getTokenType().getValue())) {
            Authentication principal = context.getPrincipal();
            String username = principal.getName(); // For SSO, this is usually the 'sub'

            // Attempt to resolve the GuestUser to populate claims
            Optional<GuestUser> guestOpt = guestUserRepository.findByEmail(username)
                .or(() -> guestUserRepository.findByPhoneNumber(username))
                .or(() -> guestUserRepository.findBySsoId(username));

            
            // If it's an SSO principal, we might need a more specific lookup 
            // but for now, we assume username matches the unique identifier (email/phone)
            
            guestOpt.ifPresent(guest -> {
                context.getClaims().claim("name", guest.getFullName());
                if (guest.getEmail() != null) {
                    context.getClaims().claim("email", guest.getEmail());
                }
                if (guest.getPhoneNumber() != null) {
                    context.getClaims().claim("phone_number", guest.getPhoneNumber());
                }
                
                // Add a custom claim to differentiate from staff
                context.getClaims().claim("shopro_user_type", "GUEST");
            });
        }
    }
}
