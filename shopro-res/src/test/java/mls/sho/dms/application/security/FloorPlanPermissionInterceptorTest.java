package mls.sho.dms.application.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import mls.sho.dms.application.exception.AccessDeniedException;
import mls.sho.dms.application.service.auth.UnauthorizedException;
import mls.sho.dms.entity.staff.Role;
import mls.sho.dms.entity.staff.StaffMember;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

class FloorPlanPermissionInterceptorTest {

    private FloorPlanPermissionInterceptor interceptor;
    private HttpServletRequest request;
    private HttpServletResponse response;

    @BeforeEach
    void setUp() {
        interceptor = new FloorPlanPermissionInterceptor();
        request = Mockito.mock(HttpServletRequest.class);
        response = Mockito.mock(HttpServletResponse.class);
    }

    @Test
    void shouldAllowGetRequestWithoutAuthentication() throws Exception {
        when(request.getServletPath()).thenReturn("/api/v1/floor-plan/layout");
        when(request.getMethod()).thenReturn("GET");
        when(request.getAttribute("staff_principal")).thenReturn(null);

        assertTrue(interceptor.preHandle(request, response, new Object()));
    }

    @Test
    void shouldDenyPostRequestWithoutAuthentication() {
        when(request.getServletPath()).thenReturn("/api/v1/floor-plan/tables");
        when(request.getMethod()).thenReturn("POST");
        when(request.getAttribute("staff_principal")).thenReturn(null);

        assertThrows(UnauthorizedException.class, () -> 
            interceptor.preHandle(request, response, new Object()));
    }

    @Test
    void shouldAllowManagerToModifyLayout() throws Exception {
        when(request.getServletPath()).thenReturn("/api/v1/floor-plan/tables");
        when(request.getMethod()).thenReturn("POST");
        
        StaffMember staff = new StaffMember();
        Role role = new Role();
        role.setName("MANAGER");
        staff.setRole(role);
        StaffMemberPrincipal principal = new StaffMemberPrincipal(staff);
        
        when(request.getAttribute("staff_principal")).thenReturn(principal);

        assertTrue(interceptor.preHandle(request, response, new Object()));
    }

    @Test
    void shouldDenyServerFromModifyingLayout() {
        when(request.getServletPath()).thenReturn("/api/v1/floor-plan/tables");
        when(request.getMethod()).thenReturn("POST");
        
        StaffMember staff = new StaffMember();
        Role role = new Role();
        role.setName("SERVER");
        staff.setRole(role);
        StaffMemberPrincipal principal = new StaffMemberPrincipal(staff);
        
        when(request.getAttribute("staff_principal")).thenReturn(principal);

        assertThrows(AccessDeniedException.class, () -> 
            interceptor.preHandle(request, response, new Object()));
    }
}
