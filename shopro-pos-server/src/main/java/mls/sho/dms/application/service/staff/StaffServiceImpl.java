package mls.sho.dms.application.service.staff;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.staff.CreateStaffRequest;
import mls.sho.dms.application.dto.staff.StaffMemberResponse;
import mls.sho.dms.application.exception.BusinessRuleException;
import mls.sho.dms.application.exception.ResourceNotFoundException;
import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.entity.staff.StaffRole;
import mls.sho.dms.repository.staff.StaffRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public StaffMemberResponse create(CreateStaffRequest request) {
        StaffRole role = parseRole(request.role());

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
            StaffRole role = parseRole(roleFilter);
            return staffRepository.findByRole(role).stream().map(this::toResponse).toList();
        }
        return staffRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public StaffMemberResponse findById(UUID id) {
        return toResponse(getOrThrow(id));
    }

    @Override
    public StaffMemberResponse updateRole(UUID id, String newRole) {
        StaffMember member = getOrThrow(id);
        member.setRole(parseRole(newRole));
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

    // ---- Helpers ----

    private StaffMember getOrThrow(UUID id) {
        return staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found: " + id));
    }

    private StaffRole parseRole(String role) {
        try {
            return StaffRole.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleException("Invalid role: " + role);
        }
    }

    private StaffMemberResponse toResponse(StaffMember m) {
        return new StaffMemberResponse(
                m.getId(),
                m.getFullName(),
                m.getRole().name(),
                m.isActive(),
                m.getLastLoginAt(),
                m.getCreatedAt()
        );
    }
}
