package mls.sho.dms.fapi;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Interceptor that logs structured FAPI audit records.
 * Records interaction IDs, DPoP thumbprints, and other FAPI-specific metadata.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class FapiAuditLogger implements HandlerInterceptor {

    private final ObjectMapper objectMapper;
    private final ThreadLocal<Long> startTime = new ThreadLocal<>();

    @Override
    public boolean preHandle(HttpServletRequest req,
                              HttpServletResponse res, Object handler) {
        startTime.set(System.currentTimeMillis());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest  req,
                                HttpServletResponse res,
                                Object handler, Exception ex) {
        long duration = System.currentTimeMillis() - (startTime.get() != null ? startTime.get() : 0);
        startTime.remove();

        try {
            // Structured audit record — written to fapi-audit.log
            Map<String, Object> record = new LinkedHashMap<>();
            record.put("ts",              Instant.now().toString());
            record.put("interactionId",   req.getAttribute("fapi.interactionId"));
            record.put("sub",             req.getAttribute("fapi.sub"));
            record.put("clientId",        req.getAttribute("fapi.clientId"));
            record.put("scope",           req.getAttribute("fapi.scope"));
            record.put("dpopVerified",    req.getAttribute("fapi.dpopVerified"));
            record.put("dpopThumbprint",  req.getAttribute("fapi.dpopKeyThumbprint"));
            record.put("method",          req.getMethod());
            record.put("path",            req.getRequestURI());
            record.put("status",          res.getStatus());
            record.put("durationMs",      duration);
            record.put("remoteIp",        req.getRemoteAddr());

            // Use dedicated "fapi-audit" logger
            org.slf4j.LoggerFactory
                .getLogger("fapi-audit")
                .info(objectMapper.writeValueAsString(record));

        } catch (Exception logEx) {
            log.error("[FAPI] Audit logging failed", logEx);
        }
    }
}
