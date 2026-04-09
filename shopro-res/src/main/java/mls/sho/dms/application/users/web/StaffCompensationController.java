package mls.sho.dms.application.users.web;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.users.service.StaffCompensationService;
import mls.sho.dms.entity.users.StaffCompensation;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/staff/{staffId}/compensation")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StaffCompensationController {

    private final StaffCompensationService compensationService;

    @GetMapping
    public StaffCompensation getCompensation(@PathVariable UUID staffId) {
        return compensationService.getCompensation(staffId);
    }

    @PutMapping
    public StaffCompensation updateCompensation(@PathVariable UUID staffId, @RequestBody StaffCompensation request) {
        return compensationService.saveCompensation(staffId, request);
    }
}
