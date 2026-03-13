package mls.sho.dms.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * High-priority CORS filter to ensure that even early rejection by security filters
 * (like DPoPFilter or PermissionInterceptors) includes the necessary CORS headers.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class GlobalCorsFilter extends OncePerRequestFilter {

    @org.springframework.beans.factory.annotation.Value("${ALLOWED_ORIGINS:*}")
    private String allowedOrigins;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String origin = request.getHeader("Origin");
        
        if (origin != null) {
            if ("*".equals(allowedOrigins)) {
                response.setHeader("Access-Control-Allow-Origin", origin);
            } else {
                java.util.List<String> allowedList = java.util.Arrays.asList(allowedOrigins.split(","));
                if (allowedList.contains(origin)) {
                    response.setHeader("Access-Control-Allow-Origin", origin);
                }
            }
        }

        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, DPoP, X-Requested-With, X-Performed-By");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Max-Age", "3600");

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
        } else {
            filterChain.doFilter(request, response);
        }
    }
}
