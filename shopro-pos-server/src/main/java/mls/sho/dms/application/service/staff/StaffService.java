package mls.sho.dms.application.service.staff;

import mls.sho.dms.application.dto.staff.CreateStaffRequest;
import mls.sho.dms.application.dto.staff.StaffMemberResponse;

import java.util.List;
import java.util.UUID;

/** Manages staff lifecycle: creation, role changes, and activation status. */
public interface StaffService {
    /** Create a new staff member. PIN is hashed before storage. */
    StaffMemberResponse create(CreateStaffRequest request);

    /** List all staff members, optionally filtered by role. */
    List<StaffMemberResponse> findAll(String roleFilter);

    /** Get a single staff member by ID. */
    StaffMemberResponse findById(UUID id);

    /** Update the role of an existing staff member. */
    StaffMemberResponse updateRole(UUID id, String newRole);

    /** Deactivate a staff member (soft-delete — preserves audit history). */
    void deactivate(UUID id);

    /** Reactivate a previously deactivated staff member. */
    StaffMemberResponse reactivate(UUID id);

    /** Update a staff member's PIN. */
    StaffMemberResponse updatePin(UUID id, String newPin);
}
