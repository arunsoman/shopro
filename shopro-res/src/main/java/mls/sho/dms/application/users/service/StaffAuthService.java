package mls.sho.dms.application.users.service;

import mls.sho.dms.application.users.exception.AuthException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.pos.repository.RestaurantRepository;
import mls.sho.dms.application.users.dto.AuthDtos.*;
import mls.sho.dms.application.users.repo.StaffRepository;
import mls.sho.dms.entity.users.Staff;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StaffAuthService {
    
    private final StaffRepository staffRepo;
    private final RestaurantRepository restaurantRepo;
    private final PinEncoder pinEncoder;
    private final JwtService jwtService;
    private final AuditService auditService;
    
    @Transactional(readOnly = true)
    public List<StaffDto> getStaffByRestaurant(Long restaurantId) {
        return staffRepo.findByRestaurantIdAndIsActiveTrue(restaurantId)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    private static final int MAX_PIN_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 30;
    
    @Transactional
    public StaffLoginResponse login(StaffLoginRequest request, String fingerprint, String ipAddress) {
        // Validate restaurant exists
        if (!restaurantRepo.existsById(request.getRestaurantId())) {
            throw new AuthException("Invalid restaurant");
        }
        
        // Find staff
        Staff staff = staffRepo.findByStaffIdAndRestaurantIdAndIsActiveTrue(
                request.getStaffId(), request.getRestaurantId())
            .orElseThrow(() -> new AuthException("Staff not found"));
        
        // Check lockout
        if (staff.isLocked()) {
            auditService.log(staff.getStaffId(), "LOGIN_BLOCKED", ipAddress, false);
            throw new AuthException("Account temporarily locked. Try again later.");
        }
        
        // Verify PIN
        if (!pinEncoder.matches(request.getPin(), staff.getPinHash())) {
            handleFailedAttempt(staff);
            auditService.log(staff.getStaffId(), "PIN_FAIL", ipAddress, false);
            throw new AuthException("Invalid PIN");
        }
        
        // Success - reset attempts and update login info
        staffRepo.resetFailedAttempts(staff.getStaffId());
        staff.setLastLoginAt(LocalDateTime.now());
        staff.setLastLoginIp(ipAddress);
        staff.setDeviceFingerprint(fingerprint);
        
        // Generate tokens
        String accessToken = jwtService.generateStaffToken(staff);
        String refreshToken = jwtService.generateStaffRefreshToken(staff);
        
        auditService.log(staff.getStaffId(), "PIN_LOGIN", ipAddress, true);
        
        mls.sho.dms.entity.Restaurant restaurant = restaurantRepo.findById(request.getRestaurantId())
            .orElse(null);
        
        return StaffLoginResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .expiresIn(28800) // 8 hours
            .restaurantId(restaurant != null ? restaurant.getId() : request.getRestaurantId())
            .restaurantName(restaurant != null ? restaurant.getName() : "Unknown Restaurant")
            .staff(mapToDto(staff))
            .build();
    }
    
    private void handleFailedAttempt(Staff staff) {
        staffRepo.incrementFailedAttempts(staff.getStaffId());
        
        if (staff.getFailedPinAttempts() + 1 >= MAX_PIN_ATTEMPTS) {
            staff.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES));
            staffRepo.save(staff);
            log.warn("Staff account locked: {}", staff.getStaffId());
        }
    }
    
    @Transactional
    public void startShift(UUID staffId, String ipAddress) {
        Staff staff = staffRepo.findById(staffId)
            .orElseThrow(() -> new AuthException("Staff not found"));
        
        staff.setShiftActive(true);
        auditService.log(staffId, "SHIFT_START", ipAddress, true);
    }
    
    @Transactional
    public void endShift(UUID staffId, String ipAddress) {
        Staff staff = staffRepo.findById(staffId)
            .orElseThrow(() -> new AuthException("Staff not found"));
        
        staff.setShiftActive(false);
        auditService.log(staffId, "SHIFT_END", ipAddress, true);
    }

    private StaffDto mapToDto(Staff staff) {
        return StaffDto.builder()
            .staffId(staff.getStaffId())
            .name(staff.getDisplayName())
            .role(staff.getRole().name())
            .shiftActive(Boolean.TRUE.equals(staff.getShiftActive()))
            .build();
    }
}