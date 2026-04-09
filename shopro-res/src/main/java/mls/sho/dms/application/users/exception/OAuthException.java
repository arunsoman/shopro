package mls.sho.dms.application.users.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class OAuthException extends RuntimeException {
    public OAuthException(String message) {
        super(message);
    }
}
