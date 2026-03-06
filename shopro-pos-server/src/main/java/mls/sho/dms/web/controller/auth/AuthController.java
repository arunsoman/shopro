package mls.sho.dms.web.controller.auth;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.auth.PinLoginRequest;
import mls.sho.dms.application.dto.auth.StaffSessionResponse;
import mls.sho.dms.application.service.auth.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "PIN-based staff login for POS terminals")
public class AuthController {

    private final AuthService authService;

    /**
     * Authenticate a staff member using their 4-digit PIN.
     * Returns their session info (id, name, role) on success.
     * Locks the terminal after 5 consecutive failures per IP.
     */
    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public StaffSessionResponse login(
            @Valid @RequestBody PinLoginRequest request,
            HttpServletRequest httpRequest
    ) {
        String remoteAddr = httpRequest.getRemoteAddr();
        return authService.login(request, remoteAddr);
    }
}
