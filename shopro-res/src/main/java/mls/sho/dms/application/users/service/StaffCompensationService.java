package mls.sho.dms.application.users.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.users.repo.StaffCompensationRepository;
import mls.sho.dms.application.users.repo.StaffRepository;
import mls.sho.dms.entity.users.Staff;
import mls.sho.dms.entity.users.StaffCompensation;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StaffCompensationService {

    private final StaffCompensationRepository compensationRepo;
    private final StaffRepository staffRepo;

    @Transactional(readOnly = true)
    public StaffCompensation getCompensation(UUID staffId) {
        return compensationRepo.findByStaffStaffId(staffId)
                .orElseThrow(() -> new RuntimeException("Compensation data not found for staff"));
    }

    @Transactional
    public StaffCompensation saveCompensation(UUID staffId, StaffCompensation request) {
        Staff staff = staffRepo.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        StaffCompensation compensation = compensationRepo.findByStaffStaffId(staffId)
                .orElse(StaffCompensation.builder().staff(staff).restaurantId(staff.getRestaurantId()).build());

        compensation.setBaseHourlyRate(request.getBaseHourlyRate());
        compensation.setOvertimeRate(request.getOvertimeRate());
        compensation.setHolidayRate(request.getHolidayRate());
        compensation.setStandardWeeklyHours(request.getStandardWeeklyHours());

        return compensationRepo.save(compensation);
    }
}
