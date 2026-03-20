package mls.sho.dms.application.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.repository.marketplace.MarketplaceUserRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class MarketplaceAuthenticationInterceptor implements HandlerInterceptor {

    private final MarketplaceUserRepository marketplaceUserRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String marketplaceUserIdHeader = request.getHeader("X-Marketplace-User-Id");
        
        if (marketplaceUserIdHeader != null) {
            try {
                UUID userId = UUID.fromString(marketplaceUserIdHeader);
                marketplaceUserRepository.findById(userId).ifPresent(user -> {
                    request.setAttribute("marketplace_principal", new MarketplaceUserPrincipal(user));
                });
            } catch (IllegalArgumentException e) {
                // Ignore invalid UUID
            }
        }
        
        return true;
    }
}
