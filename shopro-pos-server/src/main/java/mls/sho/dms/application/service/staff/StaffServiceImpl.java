package mls.sho.dms.application.service.staff;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.staff.CreateStaffRequest;
import mls.sho.dms.application.dto.staff.StaffMemberResponse;
import mls.sho.dms.application.exception.BusinessRuleException;
import mls.sho.dms.application.exception.ResourceNotFoundException;
import mls.sho.dms.entity.staff.Permission;
import mls.sho.dms.entity.staff.Role;
import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.repository.staff.RoleRepository;
import mls.sho.dms.repository.staff.StaffRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public StaffMemberResponse create(CreateStaffRequest request) {
        Role role = getRoleOrThrow(request.role());

        StaffMember member = new StaffMember();
        member.setFullName(request.fullName());
        member.setPinHash(passwordEncoder.encode(request.pin()));
        member.setRole(role);
        member.setActive(true);

        return toResponse(staffRepository.save(member));
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffMemberResponse> findAll(String roleFilter) {
        if (roleFilter != null && !roleFilter.isBlank()) {
            return staffRepository.findByRoleName(roleFilter.toUpperCase()).stream()
                    .map(this::toResponse).toList();
        }
        return staffRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public StaffMemberResponse findById(UUID id) {
        return toResponse(getOrThrow(id));
    }

    @Override
    public StaffMemberResponse updateRole(UUID id, String newRoleName) {
        StaffMember member = getOrThrow(id);
        member.setRole(getRoleOrThrow(newRoleName));
        return toResponse(staffRepository.save(member));
    }

    @Override
    public void deactivate(UUID id) {
        StaffMember member = getOrThrow(id);
        if (!member.isActive()) {
            throw new BusinessRuleException("Staff member is already deactivated.");
        }
        member.setActive(false);
        staffRepository.save(member);
    }

    @Override
    public StaffMemberResponse reactivate(UUID id) {
        StaffMember member = getOrThrow(id);
        member.setActive(true);
        return toResponse(staffRepository.save(member));
    }

    @Override
    public StaffMemberResponse updatePin(UUID id, String newPin) {
        StaffMember member = getOrThrow(id);
        member.setPinHash(passwordEncoder.encode(newPin));
        return toResponse(staffRepository.save(member));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validateManagerPin(String pin) {
        if (pin == null || pin.isEmpty()) return false;
        List<StaffMember> activeStaff = staffRepository.findByActiveTrue();
        for (StaffMember member : activeStaff) {
            if (passwordEncoder.matches(pin, member.getPinHash())) {
                String roleName = member.getRole().getName().toUpperCase();
                return List.of("OWNER", "MANAGER", "GENERAL_MANAGER").contains(roleName);
            }
        }
        return false;
    }

    // ---- Helpers ----

    private StaffMember getOrThrow(UUID id) {
        return staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found: " + id));
    }

    private Role getRoleOrThrow(String roleName) {
        return roleRepository.findByName(roleName.toUpperCase())
                .orElseThrow(() -> new BusinessRuleException("Invalid role: " + roleName));
    }

    private StaffMemberResponse toResponse(StaffMember m) {
        List<String> permissions = m.getRole() != null 
            ? m.getRole().getEffectivePermissions().stream()
                .map(Permission::getName)
                .collect(Collectors.toList())
            : List.of();

        return new StaffMemberResponse(
                m.getId(),
                m.getFullName(),
                m.getRole() != null ? m.getRole().getName() : "NONE",
                permissions,
                m.isActive(),
                m.getLastLoginAt(),
                m.getCreatedAt()
        );
    }
}
