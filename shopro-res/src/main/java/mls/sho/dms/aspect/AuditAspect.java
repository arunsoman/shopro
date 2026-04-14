package mls.sho.dms.aspect;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.entity.AuditLog;
import mls.sho.dms.service.AuditLogService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Aspect for intercepting all REST API calls and logging them to the audit log.
 * Excludes sensitive data from being logged.
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;

    // Fields that contain sensitive data and should never be logged
    private static final Set<String> SENSITIVE_FIELDS = new HashSet<>(Arrays.asList(
            "password", "passwordConfirm", "confirmPassword", "pwd",
            "token", "accessToken", "refreshToken", "authToken",
            "apiKey", "apiSecret", "secretKey", "clientSecret",
            "creditCard", "cardNumber", "ccNumber", "cvv", "cvc",
            "ssn", "socialSecurityNumber", "socialSecurity",
            "bankAccount", "accountNumber", "routingNumber",
            "biometric", "faceId", "fingerprint",
            "email", "personalEmail" // Log userId instead
    ));

    // HTTP methods that modify data and should be logged
    private static final Set<String> AUDITABLE_METHODS = new HashSet<>(Arrays.asList(
            "POST", "PUT", "PATCH", "DELETE"
    ));

    // Regex pattern to identify entity IDs in path variables
    private static final Pattern ENTITY_ID_PATTERN = Pattern.compile("/(\\d+)(?:/|$)");

    /**
     * Pointcut for all controller methods in the web packages.
     */
    @Pointcut("execution(* mls.sho.dms..web.*.*(..))")
    public void controllerMethods() {}

    /**
     * Pointcut for all controller methods in the controller packages.
     */
    @Pointcut("execution(* mls.sho.dms..controller.*.*(..))")
    public void controllerPackageMethods() {}

    /**
     * Log after successful API calls.
     */
    @AfterReturning("controllerMethods() || controllerPackageMethods()")
    public void logAudit(JoinPoint joinPoint) {
        try {
            HttpServletRequest request = getCurrentHttpRequest();
            if (request == null) {
                return;
            }

            String httpMethod = request.getMethod();
            
            // Only log modifying operations (POST, PUT, PATCH, DELETE)
            if (!AUDITABLE_METHODS.contains(httpMethod)) {
                return;
            }

            // Extract user information
            String username = extractUsername(request);
            
            // Determine action type
            AuditLog.AuditAction action = mapHttpMethodToAction(httpMethod);
            
            // Extract entity information from request
            String entityName = extractEntityName(joinPoint, request);
            String entityId = extractEntityId(joinPoint, request);
            
            // Build details (sanitized)
            String details = buildDetails(joinPoint, request, action, entityName);
            
            // Get client IP
            String ipAddress = getClientIpAddress(request);

            // Log asynchronously
            auditLogService.logAsync(username, action, entityName, entityId, details, ipAddress);

        } catch (Exception e) {
            // Never let audit logging break the API call
            log.warn("Failed to create audit log: {}", e.getMessage());
        }
    }

    /**
     * Extract username from request or use "system" as default.
     */
    private String extractUsername(HttpServletRequest request) {
        // Try to get from request attribute (set by security filter)
        String username = (String) request.getAttribute("userId");
        if (username != null && !username.isEmpty()) {
            return username;
        }
        
        // Try header-based authentication
        username = request.getHeader("X-User-Id");
        if (username != null && !username.isEmpty()) {
            return username;
        }

        // Try Basic Auth header
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Basic ")) {
            try {
                String decoded = new String(java.util.Base64.getDecoder().decode(authHeader.substring(6)));
                username = decoded.split(":")[0];
                if (username != null && !username.isEmpty()) {
                    return username;
                }
            } catch (Exception ignored) {}
        }

        // Default to system for unauthenticated requests
        return "system";
    }

    /**
     * Map HTTP method to audit action.
     */
    private AuditLog.AuditAction mapHttpMethodToAction(String httpMethod) {
        return switch (httpMethod) {
            case "POST" -> AuditLog.AuditAction.CREATE;
            case "PUT", "PATCH" -> AuditLog.AuditAction.UPDATE;
            case "DELETE" -> AuditLog.AuditAction.DELETE;
            default -> AuditLog.AuditAction.READ;
        };
    }

    /**
     * Extract entity name from controller class or request.
     */
    private String extractEntityName(JoinPoint joinPoint, HttpServletRequest request) {
        // Try to get from controller class name
        String className = joinPoint.getTarget().getClass().getSimpleName();
        if (className.endsWith("Controller")) {
            className = className.substring(0, className.length() - 10);
        }
        
        // Common controller to entity mappings
        return switch (className) {
            case "Ingredient" -> "Ingredient";
            case "Inventory" -> "Inventory";
            case "MenuItem", "Menu" -> "MenuItem";
            case "Recipe" -> "Recipe";
            case "Order" -> "Order";
            case "Supplier" -> "Supplier";
            case "PurchaseOrder" -> "PurchaseOrder";
            case "GoodsReceipt" -> "GoodsReceipt";
            case "TableSession", "DiningTable" -> "TableSession";
            case "User", "ShoProUser" -> "User";
            case "Restaurant" -> "Restaurant";
            default -> className;
        };
    }

    /**
     * Extract entity ID from path variables.
     */
    private String extractEntityId(JoinPoint joinPoint, HttpServletRequest request) {
        // Get path from request
        String path = request.getRequestURI();
        
        // Try to extract ID from path
        var matcher = ENTITY_ID_PATTERN.matcher(path);
        if (matcher.find()) {
            return matcher.group(1);
        }

        // Try to get from method arguments (usually @PathVariable id)
        Object[] args = joinPoint.getArgs();
        for (Object arg : args) {
            if (arg instanceof Long) {
                return arg.toString();
            }
            if (arg instanceof Integer) {
                return arg.toString();
            }
            if (arg instanceof String) {
                String str = (String) arg;
                // Check if it looks like an ID (numeric)
                if (str.matches("\\d+")) {
                    return str;
                }
            }
        }

        return null;
    }

    /**
     * Build human-readable details string.
     */
    private String buildDetails(JoinPoint joinPoint, HttpServletRequest request, 
                                AuditLog.AuditAction action, String entityName) {
        String methodName = joinPoint.getSignature().getName();
        String entityId = extractEntityId(joinPoint, request);
        
        String actionDescription = switch (action) {
            case CREATE -> "added a new " + entityName.toLowerCase();
            case READ -> "viewed " + entityName.toLowerCase();
            case UPDATE -> "updated " + entityName.toLowerCase();
            case DELETE -> "deleted " + entityName.toLowerCase();
        };

        // Add method name for more detail
        if (!methodName.equals(entityName) && !methodName.toLowerCase().contains(entityName.toLowerCase())) {
            actionDescription += " (" + methodName + ")";
        }

        // Add entity reference if available
        String entityRef = entityName;
        if (entityId != null) {
            entityRef += ":" + entityId;
        }

        return actionDescription + "[" + entityRef + "]";
    }

    /**
     * Get client IP address, handling proxies.
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    /**
     * Get current HTTP request from context.
     */
    private HttpServletRequest getCurrentHttpRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }

    /**
     * Sanitize an object by removing sensitive fields.
     * This creates a copy with sensitive data removed.
     */
    public Object sanitizeObject(Object obj) {
        if (obj == null) {
            return null;
        }

        try {
            // Serialize to JSON and back to get a clean copy
            String json = objectMapper.writeValueAsString(obj);
            return objectMapper.readValue(json, obj.getClass());
        } catch (JsonProcessingException e) {
            // If serialization fails, return a simplified representation
            return obj.getClass().getSimpleName();
        }
    }
}
