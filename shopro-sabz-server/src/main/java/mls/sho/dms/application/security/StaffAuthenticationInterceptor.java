package mls.sho.dms.application.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.repository.staff.StaffRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.security.Principal;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class StaffAuthenticationInterceptor implements HandlerInterceptor {

    private final StaffRepository staffRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String staffIdHeader = request.getHeader("X-Staff-Id");
        
        if (staffIdHeader != null) {
            try {
                UUID staffId = UUID.fromString(staffIdHeader);
                staffRepository.findById(staffId).ifPresent(staff -> {
                    // Wrap the request to provide the custom Principal
                    // Note: In standard Spring MVC, we can also set a request attribute
                    request.setAttribute("staff_principal", new StaffMemberPrincipal(staff));
                });
            } catch (IllegalArgumentException e) {
                // Ignore invalid UUID
            }
        }
        
        return true;
    }
}
