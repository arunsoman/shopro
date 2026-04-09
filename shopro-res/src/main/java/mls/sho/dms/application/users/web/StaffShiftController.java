package mls.sho.dms.application.users.web;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.users.service.StaffShiftService;
import mls.sho.dms.entity.users.StaffShift;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/staff/{staffId}/shifts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StaffShiftController {

    private final StaffShiftService shiftService;

    @PostMapping("/clock-in")
    public StaffShift clockIn(@PathVariable Long restaurantId, @PathVariable UUID staffId) {
        return shiftService.clockIn(staffId, restaurantId);
    }

    @PostMapping("/clock-out")
    public StaffShift clockOut(@PathVariable UUID staffId) {
        return shiftService.clockOut(staffId);
    }

    @GetMapping
    public List<StaffShift> getShiftHistory(@PathVariable UUID staffId) {
        return shiftService.getStaffShiftHistory(staffId);
    }

    @GetMapping("/active")
    public List<StaffShift> getActiveShifts(@PathVariable Long restaurantId) {
        return shiftService.getActiveShifts(restaurantId);
    }
}
