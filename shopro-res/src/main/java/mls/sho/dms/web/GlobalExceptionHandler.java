package mls.sho.dms.web;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.Instant;
import java.util.Map;

/**
 * Global exception handler for all REST controllers.
 * Converts unhandled exceptions into structured RFC 7807 ProblemDetail responses
 * and logs the exact endpoint + missing/wrong parameters.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ── 400: Missing required request parameter ──────────────────────

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ProblemDetail handleMissingParam(MissingServletRequestParameterException ex,
                                            HttpServletRequest request) {
        String param = ex.getParameterName();
        String type = ex.getParameterType();
        String endpoint = request.getMethod() + " " + request.getRequestURI();

        log.warn("Missing required parameter: {} (type={}) on endpoint [{}]",
                 param, type, endpoint);

        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        pd.setTitle("Missing required parameter");
        pd.setDetail(String.format(
                "Required request parameter '%s' (type: %s) is not present on endpoint: %s",
                param, type, endpoint));
        pd.setProperty("timestamp", Instant.now());
        pd.setProperty("parameter", param);
        pd.setProperty("parameterType", type);
        pd.setProperty("endpoint", endpoint);
        return pd;
    }

    // ── 400: Type mismatch (e.g. invalid date format, non-numeric path var) ──

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ProblemDetail handleTypeMismatch(MethodArgumentTypeMismatchException ex,
                                            HttpServletRequest request) {
        String endpoint = request.getMethod() + " " + request.getRequestURI();
        String param = ex.getName();
        String requiredType = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown";
        String value = ex.getValue() != null ? ex.getValue().toString() : "null";

        log.warn("Type mismatch: parameter '{}' value='{}' expected type={} on endpoint [{}]",
                 param, value, requiredType, endpoint);

        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        pd.setTitle("Invalid parameter value");
        pd.setDetail(String.format(
                "Parameter '%s' received value '%s' but expected type %s on endpoint: %s",
                param, value, requiredType, endpoint));
        pd.setProperty("timestamp", Instant.now());
        pd.setProperty("parameter", param);
        pd.setProperty("expectedType", requiredType);
        pd.setProperty("receivedValue", value);
        pd.setProperty("endpoint", endpoint);
        return pd;
    }

    // ── 404: No resource / handler found ─────────────────────────────

    @ExceptionHandler(NoResourceFoundException.class)
    public ProblemDetail handleNotFound(NoResourceFoundException ex,
                                        HttpServletRequest request) {
        String endpoint = request.getMethod() + " " + request.getRequestURI();

        log.warn("No handler found for endpoint [{}]", endpoint);

        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
        pd.setTitle("Not found");
        pd.setDetail("No handler for endpoint: " + endpoint);
        pd.setProperty("timestamp", Instant.now());
        pd.setProperty("endpoint", endpoint);
        return pd;
    }

    // ── 500: Catch-all for unhandled exceptions ──────────────────────

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGeneric(Exception ex,
                                       HttpServletRequest request) {
        String endpoint = request.getMethod() + " " + request.getRequestURI();

        log.error("Unhandled exception on endpoint [{}]: {}", endpoint, ex.getMessage(), ex);

        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        pd.setTitle("Internal server error");
        pd.setDetail("Unexpected error on endpoint: " + endpoint);
        pd.setProperty("timestamp", Instant.now());
        pd.setProperty("endpoint", endpoint);
        return pd;
    }
}