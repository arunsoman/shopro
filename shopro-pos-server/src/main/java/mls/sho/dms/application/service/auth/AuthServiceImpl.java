package mls.sho.dms.application.service.auth;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.auth.PinLoginRequest;
import mls.sho.dms.application.dto.auth.StaffSessionResponse;
import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.repository.staff.StaffRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final int MAX_ATTEMPTS     = 5;
    private static final long LOCKOUT_SECONDS = 60;

    private final StaffRepository staffRepository;
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
        return new StaffSessionResponse(staff.getId(), staff.getFullName(), staff.getRole().name());
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
