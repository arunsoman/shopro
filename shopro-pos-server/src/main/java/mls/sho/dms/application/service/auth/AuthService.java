package mls.sho.dms.application.service.auth;

import mls.sho.dms.application.dto.auth.PinLoginRequest;
import mls.sho.dms.application.dto.auth.StaffSessionResponse;
import mls.sho.dms.application.dto.auth.SupplierLoginRequest;
import mls.sho.dms.application.dto.auth.SupplierSessionResponse;

public interface AuthService {
    /**
     * Validates the provided PIN against all active staff members.
     * Applies a 5-attempt lockout keyed on remote address/session.
     *
     * @throws UnauthorizedException if PIN is wrong or account is inactive.
     * @throws TerminalLockedException if 5 consecutive failures have occurred.
     */
    StaffSessionResponse login(PinLoginRequest request, String remoteAddr, String jkt);

    /**
     * Authenticates an external supplier using email/password.
     */
    SupplierSessionResponse supplierLogin(SupplierLoginRequest request, String remoteAddr);
}
