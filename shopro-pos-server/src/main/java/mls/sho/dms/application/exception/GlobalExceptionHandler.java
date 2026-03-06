package mls.sho.dms.application.exception;

import mls.sho.dms.application.dto.ApiErrorResponse;
import mls.sho.dms.application.dto.ValidationErrorResponse;
import mls.sho.dms.application.service.auth.UnauthorizedException;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ISO_INSTANT.withZone(ZoneOffset.UTC);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    public ValidationErrorResponse handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, List<String>> details = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .collect(Collectors.groupingBy(
                FieldError::getField,
                Collectors.mapping(FieldError::getDefaultMessage, Collectors.toList())
            ));
            
        return new ValidationErrorResponse(422, "Validation failed.", details);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiErrorResponse handleResourceNotFound(ResourceNotFoundException ex) {
        return new ApiErrorResponse(404, ex.getMessage(), FMT.format(Instant.now()));
    }

    @ExceptionHandler(BusinessRuleException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ApiErrorResponse handleBusinessRuleException(BusinessRuleException ex) {
        return new ApiErrorResponse(409, ex.getMessage(), FMT.format(Instant.now()));
    }

    @ExceptionHandler(UnauthorizedException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiErrorResponse handleUnauthorized(UnauthorizedException ex) {
        return new ApiErrorResponse(401, ex.getMessage(), FMT.format(Instant.now()));
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiErrorResponse handleGeneralException(Exception ex) {
        // In production, replace ex.getMessage() with a generic string.
        // During development, exposing the message helps diagnose issues faster.
        String detail = ex.getCause() != null
            ? ex.getCause().getMessage()
            : ex.getMessage();
        return new ApiErrorResponse(500, "Server error: " + detail, FMT.format(Instant.now()));
    }
}
