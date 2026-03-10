package mls.sho.dms.web.controller.auth;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.auth.SupplierLoginRequest;
import mls.sho.dms.application.dto.auth.SupplierSessionResponse;
import mls.sho.dms.application.service.auth.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/supplier/auth")
@RequiredArgsConstructor
@Tag(name = "Supplier Authentication", description = "Email-based login for external vendors")
public class SupplierAuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public SupplierSessionResponse login(
            @Valid @RequestBody SupplierLoginRequest request,
            HttpServletRequest httpRequest
    ) {
        String remoteAddr = httpRequest.getRemoteAddr();
        return authService.supplierLogin(request, remoteAddr);
    }
}
