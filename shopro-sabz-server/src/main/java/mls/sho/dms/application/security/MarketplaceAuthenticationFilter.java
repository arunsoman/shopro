package mls.sho.dms.application.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.entity.marketplace.MarketplaceUser;
import mls.sho.dms.repository.marketplace.MarketplaceUserRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.Principal;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class MarketplaceAuthenticationFilter extends OncePerRequestFilter {

    private final MarketplaceUserRepository marketplaceUserRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String marketplaceUserIdHeader = request.getHeader("X-Marketplace-User-Id");
        log.debug("MarketplaceAuthenticationFilter: X-Marketplace-User-Id header = {}", marketplaceUserIdHeader);
        HttpServletRequest requestToUse = request;

        if (marketplaceUserIdHeader != null) {
            try {
                UUID userId = UUID.fromString(marketplaceUserIdHeader);
                Optional<MarketplaceUser> userOpt = marketplaceUserRepository.findById(userId);
                
                if (userOpt.isPresent()) {
                    MarketplaceUserPrincipal principal = new MarketplaceUserPrincipal(userOpt.get());
                    log.debug("MarketplaceAuthenticationFilter: Authenticated user = {}, role = {}", principal.getName(), principal.getRole());
                    request.setAttribute("marketplace_principal", principal);
                    
                    // Wrap the request to override getUserPrincipal()
                    requestToUse = new HttpServletRequestWrapper(request) {
                        @Override
                        public Principal getUserPrincipal() {
                            return principal;
                        }
                    };
                }
            } catch (IllegalArgumentException e) {
                // Ignore invalid UUID
            }
        }

        filterChain.doFilter(requestToUse, response);
    }
}
