package mls.sho.dms.web.controller.staff;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.staff.CreateStaffRequest;
import mls.sho.dms.application.dto.staff.StaffMemberResponse;
import mls.sho.dms.application.dto.staff.UpdateStaffRoleRequest;
import mls.sho.dms.application.service.staff.StaffService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST API for Staff Management.
 * All endpoints are secured at the application layer — only OWNER/MANAGER roles
 * should be granted access via the frontend's ProtectedRoute.
 */
@RestController
@RequestMapping("/api/v1/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    /** List all staff, optionally filter by role query param. */
    @GetMapping
    public List<StaffMemberResponse> list(@RequestParam(required = false) String role) {
        return staffService.findAll(role);
    }

    /** Get a specific staff member by ID. */
    @GetMapping("/{id}")
    public StaffMemberResponse getById(@PathVariable UUID id) {
        return staffService.findById(id);
    }

    /** Register a new staff member with a hashed PIN. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StaffMemberResponse create(@Valid @RequestBody CreateStaffRequest request) {
        return staffService.create(request);
    }

    /** Update the role of an existing staff member. */
    @PatchMapping("/{id}/role")
    public StaffMemberResponse updateRole(@PathVariable UUID id,
                                          @Valid @RequestBody UpdateStaffRoleRequest request) {
        return staffService.updateRole(id, request.role());
    }

    /** Update a staff member's PIN. */
    @PatchMapping("/{id}/pin")
    public StaffMemberResponse updatePin(@PathVariable UUID id,
                                         @RequestBody Map<String, String> body) {
        String newPin = body.get("pin");
        if (newPin == null || !newPin.matches("\\d{4}")) {
            throw new mls.sho.dms.application.exception.BusinessRuleException("PIN must be exactly 4 digits.");
        }
        return staffService.updatePin(id, newPin);
    }

    /** Soft-delete: deactivate a staff member. */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable UUID id) {
        staffService.deactivate(id);
    }

    /** Reactivate a previously deactivated staff member. */
    @PostMapping("/{id}/reactivate")
    public StaffMemberResponse reactivate(@PathVariable UUID id) {
        return staffService.reactivate(id);
    }
}
