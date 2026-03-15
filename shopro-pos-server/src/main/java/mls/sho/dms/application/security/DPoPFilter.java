package mls.sho.dms.application.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import mls.sho.dms.entity.staff.DeviceBinding;
import mls.sho.dms.repository.staff.DeviceBindingRepository;


import java.io.IOException;
import java.util.UUID;

/**
 * Enforces FAPI 2.0 / DPoP security for sensitive operations.
 * This filter runs before the application logic but after basic authentication (if any).
 */
@Component
public class DPoPFilter extends OncePerRequestFilter {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(DPoPFilter.class);

    @Autowired
    private DPoPService dpopService;
    @Autowired
    private DeviceBindingRepository deviceBindingRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String path = request.getServletPath();
        String method = request.getMethod();
        String staffIdHeader = request.getHeader("X-Staff-Id");
        String dpopHeader = request.getHeader("DPoP");
        
        boolean isStrictPath = isSensitivePath(path);
        
        // Enforce DPoP strictly for sensitive operations.
        // For non-sensitive paths (like login), we ignore the header to allow broad client interceptors.
        boolean shouldEnforce = isStrictPath && !"GET".equalsIgnoreCase(method);

        if (dpopHeader != null) {
            String expectedThumbprint = null;
            if (isStrictPath && staffIdHeader != null) {
                try {
                    UUID staffId = UUID.fromString(staffIdHeader);
                    expectedThumbprint = deviceBindingRepository.findByStaffMemberId(staffId).stream()
                            .filter(b -> !b.isRevoked())
                            .map(DeviceBinding::getPublicKeyThumbprint)
                            .findFirst()
                            .orElse(null);
                } catch (IllegalArgumentException e) {
                    // Ignore invalid IDs
                }
            }

            String verifiedJkt = dpopService.validateProof(dpopHeader, request, expectedThumbprint);

            if (verifiedJkt != null) {
                request.setAttribute("dpop_verified", true);
                request.setAttribute("bound_dpop_jkt", verifiedJkt);
            } else if (shouldEnforce) {
                log.warn("DPoPFilter rejecting request: DPoP Service validation failed for path={}, method={}", path, method);
                // Only block if it's a sensitive path AND validation failed
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"invalid_dpop_proof\", \"message\": \"A valid DPoP proof is required for this operation.\"}");
                return;
            }
        } else if (shouldEnforce) {
            log.warn("DPoPFilter rejecting request: Missing DPoP header for path={}, method={}", path, method);
            // Missing header on sensitive path
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"invalid_dpop_proof\", \"message\": \"A valid DPoP proof is required for this operation.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isHighValueOperation(String path) {
        return path.startsWith("/api/v1/payments") || path.startsWith("/api/v1/admin/settings");
    }

    private boolean isSensitivePath(String path) {
        return path.startsWith("/api/v1/payments") || 
               path.startsWith("/api/v1/orders") ||
               path.startsWith("/api/v1/admin") || 
               path.startsWith("/api/v1/staff") ||
               path.startsWith("/api/v1/taxes") ||
               path.startsWith("/api/v1/floor-plan/tables"); // Table status changes are sensitive
    }
}
