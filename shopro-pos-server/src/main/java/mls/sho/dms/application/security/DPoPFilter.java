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
            java.util.List<DeviceBinding> allBindings = new java.util.ArrayList<>();
            if (isStrictPath && staffIdHeader != null) {
                try {
                    UUID staffId = UUID.fromString(staffIdHeader);
                    allBindings = deviceBindingRepository.findByStaffMemberId(staffId);
                } catch (IllegalArgumentException e) {
                    // Ignore invalid IDs
                }
            }

            DPoPService.ValidationResult result = null;
            if (allBindings.isEmpty()) {
                // If no bindings ever found but Header is present, validate signature/URL only
                result = dpopService.validateProof(dpopHeader, request, null);
            } else {
                // 1. First check if any ACTIVE binding matches the provided proof
                for (DeviceBinding b : allBindings) {
                    if (!b.isRevoked()) {
                        result = dpopService.validateProof(dpopHeader, request, b.getPublicKeyThumbprint());
                        if (result.isValid()) break;
                    }
                }

                // 2. If no active match, check if it matches a REVOKED binding to detect "logged in elsewhere"
                if (result == null || !result.isValid()) {
                    for (DeviceBinding b : allBindings) {
                        if (b.isRevoked()) {
                            // We use validateProof with null expectedThumbprint just to get the actual jkt from the header
                            DPoPService.ValidationResult jktResult = dpopService.validateProof(dpopHeader, request, null);
                            if (jktResult.isValid() && jktResult.jkt().equals(b.getPublicKeyThumbprint())) {
                                log.warn("DPoPFilter detecting revoked session: jkt {} matches a revoked binding for staff {}", jktResult.jkt(), staffIdHeader);
                                result = DPoPService.ValidationResult.failure("session_revoked", "Your session was revoked because you logged in from another device. Please log in again.");
                                break;
                            }
                        }
                    }
                }
                
                // 3. Fallback: if still no result (e.g. jkt doesn't match ANY binding), use the last failure result
                if (result == null) {
                    result = dpopService.validateProof(dpopHeader, request, null);
                }
            }

            if (result != null && result.isValid()) {
                request.setAttribute("dpop_verified", true);
                request.setAttribute("bound_dpop_jkt", result.jkt());
            } else if (shouldEnforce) {
                String error = (result != null) ? result.error() : "invalid_dpop_proof";
                String message = (result != null) ? result.message() : "A valid DPoP proof is required for this operation.";
                String interactionId = (String) request.getAttribute("x-fapi-interaction-id");
                
                log.warn("DPoPFilter rejecting request: {} (code={}) for path={}, method={}, interactionId={}", 
                    message, error, path, method, interactionId);
                
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write(String.format("{\"error\": \"%s\", \"message\": \"%s\"}", error, message));
                return;
            }
        } else if (shouldEnforce) {
            log.warn("DPoPFilter rejecting request: Missing DPoP header for path={}, method={}", path, method);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"missing_dpop_header\", \"message\": \"Missing DPoP proof header.\"}");
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
