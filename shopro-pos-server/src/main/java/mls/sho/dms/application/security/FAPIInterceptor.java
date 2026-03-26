package mls.sho.dms.application.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.UUID;

/**
 * Implements FAPI 2.0 / Financial-grade API correlation and logging.
 * Ensures every request has a unique interaction ID for end-to-end traceability.
 */
@Component
public class FAPIInterceptor implements HandlerInterceptor {

    private static final String FAPI_INTERACTION_ID = "x-fapi-interaction-id";
    private static final String MDC_INTERACTION_ID = "interactionId";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String interactionId = request.getHeader(FAPI_INTERACTION_ID);
        
        if (interactionId == null || interactionId.isBlank()) {
            interactionId = UUID.randomUUID().toString();
        }

        // Add to MDC for automatic logging in every downstream service/repository
        MDC.put(MDC_INTERACTION_ID, interactionId);
        
        // Add to request attribute for easy retrieval in services (like OrderAuditLog)
        request.setAttribute(FAPI_INTERACTION_ID, interactionId);
        
        // FAPI 2.0 requires returning the interaction ID in the response headers
        response.setHeader(FAPI_INTERACTION_ID, interactionId);
        
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        MDC.remove(MDC_INTERACTION_ID);
    }
}
