package mls.sho.dms.application.users.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.users.repo.StaffRepository;
import mls.sho.dms.application.users.repo.StaffShiftRepository;
import mls.sho.dms.entity.users.Staff;
import mls.sho.dms.entity.users.StaffShift;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StaffShiftService {

    private final StaffShiftRepository shiftRepo;
    private final StaffRepository staffRepo;

    @Transactional
    public StaffShift clockIn(UUID staffId, Long restaurantId) {
        Staff staff = staffRepo.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        // Ensure no active shift exists
        shiftRepo.findTopByStaffStaffIdAndIsActiveTrueOrderByClockInDesc(staffId)
                .ifPresent(s -> {
                    throw new RuntimeException("Staff already has an active shift");
                });

        StaffShift shift = StaffShift.builder()
                .staff(staff)
                .restaurantId(restaurantId)
                .clockIn(LocalDateTime.now())
                .isActive(true)
                .build();

        staff.setShiftActive(true);
        staffRepo.save(staff);
        return shiftRepo.save(shift);
    }

    @Transactional
    public StaffShift clockOut(UUID staffId) {
        StaffShift shift = shiftRepo.findTopByStaffStaffIdAndIsActiveTrueOrderByClockInDesc(staffId)
                .orElseThrow(() -> new RuntimeException("No active shift found for staff"));

        shift.clockOut();
        
        Staff staff = shift.getStaff();
        staff.setShiftActive(false);
        staffRepo.save(staff);
        
        return shiftRepo.save(shift);
    }

    @Transactional(readOnly = true)
    public List<StaffShift> getStaffShiftHistory(UUID staffId) {
        return shiftRepo.findByStaffStaffIdOrderByClockInDesc(staffId);
    }

    @Transactional(readOnly = true)
    public List<StaffShift> getActiveShifts(Long restaurantId) {
        return shiftRepo.findByRestaurantIdAndIsActiveTrue(restaurantId);
    }
}
