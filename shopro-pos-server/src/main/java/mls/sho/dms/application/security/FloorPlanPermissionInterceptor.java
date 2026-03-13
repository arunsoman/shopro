package mls.sho.dms.application.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import mls.sho.dms.application.exception.AccessDeniedException;
import mls.sho.dms.application.service.auth.UnauthorizedException;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class FloorPlanPermissionInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String path = request.getServletPath();
        String method = request.getMethod();

        if (!path.startsWith("/api/v1/floor-plan")) {
            return true;
        }

        StaffMemberPrincipal principal = (StaffMemberPrincipal) request.getAttribute("staff_principal");
        if (principal == null) {
            // For now, allow reading layout if not authenticated, but restrict updates
            if ("GET".equalsIgnoreCase(method)) return true;
            throw new UnauthorizedException("Authentication required for floor plan operations.");
        }

        String role = principal.getRole();

        // 1. Layout Management (Sections/Tables creation/editing/moving)
        if (path.contains("/sections") || 
            (path.contains("/tables") && ("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method) || "DELETE".equalsIgnoreCase(method))) ||
            path.endsWith("/position")) {
            
            if (!"OWNER".equals(role) && !"MANAGER".equals(role)) {
                throw new AccessDeniedException("Only Managers/Owners can modify the floor layout.");
            }
        }

        // 2. Operational Transitions (Status updates)
        if (path.endsWith("/status")) {
            // BUSSER can only mark tables as CLEANING or AVAILABLE (if DIRTY)
            if ("BUSSER".equals(role)) {
                // Finer-grained check would be in the service layer, but we can block others here
                // For now, let's allow basic status updates for staff
                return true; 
            }
        }

        return true;
    }
}
