package mls.sho.dms.application.service.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.dto.auth.PinLoginRequest;
import mls.sho.dms.application.dto.auth.StaffSessionResponse;
import mls.sho.dms.application.dto.auth.SupplierLoginRequest;
import mls.sho.dms.application.dto.auth.SupplierSessionResponse;
import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.repository.staff.StaffRepository;
import mls.sho.dms.repository.inventory.SupplierUserRepository;
import mls.sho.dms.entity.inventory.SupplierUser;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import mls.sho.dms.entity.staff.Permission;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final int MAX_ATTEMPTS     = 5;
    private static final long LOCKOUT_SECONDS = 60;

    private final StaffRepository staffRepository;
    private final SupplierUserRepository supplierUserRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    /** In-memory attempt tracker keyed by remote IP. */
    private final Map<String, FailureRecord> failureTracker = new ConcurrentHashMap<>();

    @Override
    @Transactional(readOnly = true)
    public StaffSessionResponse login(PinLoginRequest request, String remoteAddr) {
        checkLockout(remoteAddr);

        List<StaffMember> activeStaff = staffRepository.findByActiveTrue();

        Optional<StaffMember> matched = activeStaff.stream()
                .filter(s -> passwordEncoder.matches(request.pin(), s.getPinHash()))
                .findFirst();

        if (matched.isEmpty()) {
            recordFailure(remoteAddr);
            throw new UnauthorizedException("Incorrect PIN. Please try again.");
        }

        // Success — reset failure counter
        failureTracker.remove(remoteAddr);

        StaffMember staff = matched.get();
        String roleName = (staff.getRole() != null) ? staff.getRole().getName() : "NONE";
        
        List<String> permissions = List.of();
        if (staff.getRole() != null) {
            permissions = staff.getRole().getEffectivePermissions().stream()
                    .map(Permission::getName)
                    .collect(Collectors.toList());
        }

        return new StaffSessionResponse(staff.getId(), staff.getFullName(), roleName, permissions);
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierSessionResponse supplierLogin(SupplierLoginRequest request, String remoteAddr) {
        checkLockout(remoteAddr);

        SupplierUser user = supplierUserRepository.findByEmail(request.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials."));

        if (!user.isActive()) {
            throw new UnauthorizedException("Account is disabled.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            recordFailure(remoteAddr);
            throw new UnauthorizedException("Invalid credentials.");
        }

        // Success — reset failure counter
        failureTracker.remove(remoteAddr);

        return new SupplierSessionResponse(
            user.getId(),
            user.getSupplier().getId(),
            user.getSupplier().getCompanyName(),
            user.getFullName(),
            user.getRole().name()
        );
    }

    private void checkLockout(String addr) {
        FailureRecord rec = failureTracker.get(addr);
        if (rec == null) return;

        if (rec.count() >= MAX_ATTEMPTS) {
            long secondsElapsed = Instant.now().getEpochSecond() - rec.lockedAt().getEpochSecond();
            if (secondsElapsed < LOCKOUT_SECONDS) {
                long remaining = LOCKOUT_SECONDS - secondsElapsed;
                throw new UnauthorizedException(
                    "Too many attempts. Terminal locked for " + remaining + " more second(s).");
            }
            // Lockout expired — reset
            failureTracker.remove(addr);
        }
    }

    private void recordFailure(String addr) {
        failureTracker.compute(addr, (k, existing) -> {
            if (existing == null || existing.count() >= MAX_ATTEMPTS) {
                return new FailureRecord(1, Instant.now());
            }
            int next = existing.count() + 1;
            return new FailureRecord(next, next >= MAX_ATTEMPTS ? Instant.now() : existing.lockedAt());
        });
    }

    private record FailureRecord(int count, Instant lockedAt) {}
}
