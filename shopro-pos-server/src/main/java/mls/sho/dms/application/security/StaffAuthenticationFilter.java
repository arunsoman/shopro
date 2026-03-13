package mls.sho.dms.application.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.repository.staff.StaffRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.Principal;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class StaffAuthenticationFilter extends OncePerRequestFilter {

    private final StaffRepository staffRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String staffIdHeader = request.getHeader("X-Staff-Id");
        HttpServletRequest requestToUse = request;

        if (staffIdHeader != null) {
            try {
                UUID staffId = UUID.fromString(staffIdHeader);
                Optional<StaffMember> staffOpt = staffRepository.findById(staffId);
                
                if (staffOpt.isPresent()) {
                    StaffMemberPrincipal principal = new StaffMemberPrincipal(staffOpt.get());
                    request.setAttribute("staff_principal", principal);
                    
                    // Wrap the request to override getUserPrincipal()
                    requestToUse = new HttpServletRequestWrapper(request) {
                        @Override
                        public Principal getUserPrincipal() {
                            return principal;
                        }
                    };
                }
            } catch (IllegalArgumentException e) {
                // Ignore invalid UUID
            }
        }

        filterChain.doFilter(requestToUse, response);
    }
}
