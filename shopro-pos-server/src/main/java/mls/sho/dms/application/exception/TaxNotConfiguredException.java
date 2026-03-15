package mls.sho.dms.application.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when an operation requires tax configuration (e.g. adding items to an order)
 * but the venue has no assigned country or applicable tax rules.
 */
@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class TaxNotConfiguredException extends RuntimeException {
    public TaxNotConfiguredException(String message) {
        super(message);
    }
}
