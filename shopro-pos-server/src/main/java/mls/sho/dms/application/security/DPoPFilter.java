package mls.sho.dms.application.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Enforces FAPI 2.0 / DPoP security for sensitive operations.
 * This filter runs before the application logic but after basic authentication (if any).
 */
@Component
public class DPoPFilter extends OncePerRequestFilter {

    @Autowired
    private DPoPService dpopService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String path = request.getServletPath();
        String method = request.getMethod();
        
        // Only enforce DPoP for specific sensitive paths (e.g., payments, admin)
        // or if the DPoP header is present.
        boolean isStrictPath = isSensitivePath(path);
        
        // Pragmatic transition: Only enforce DPoP on GET requests if the header is actually present.
        // Always enforce on POST/PUT/DELETE for sensitive paths.
        boolean shouldEnforce = (isStrictPath && !"GET".equalsIgnoreCase(method)) || 
                                request.getHeader("DPoP") != null ||
                                (isStrictPath && isHighValueOperation(path));

        if (shouldEnforce) {
            String dpopHeader = request.getHeader("DPoP");
            String expectedThumbprint = getExpectedThumbprint(request);
            
            if (!dpopService.validateProof(dpopHeader, request, expectedThumbprint)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"invalid_dpop_proof\", \"message\": \"A valid DPoP proof is required for this operation.\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isHighValueOperation(String path) {
        // Payments always require DPoP
        return path.startsWith("/api/v1/payments");
    }

    private boolean isSensitivePath(String path) {
        return path.startsWith("/api/v1/payments") || 
               path.startsWith("/api/v1/admin") || 
               path.startsWith("/api/v1/staff") ||
               path.startsWith("/api/v1/floor-plan");
    }

    private String getExpectedThumbprint(HttpServletRequest request) {
        // Placeholder: retrieve from secure session or associated JWT claim
        return request.getAttribute("bound_dpop_jkt") != null ? (String) request.getAttribute("bound_dpop_jkt") : null;
    }
}
