package mls.sho.dms.application.security;

import mls.sho.dms.entity.staff.StaffMember;
import java.security.Principal;
import java.util.UUID;

public class StaffMemberPrincipal implements Principal {
    private final StaffMember staffMember;

    public StaffMemberPrincipal(StaffMember staffMember) {
        this.staffMember = staffMember;
    }

    @Override
    public String getName() {
        return staffMember.getFullName();
    }

    public UUID getId() {
        return staffMember.getId();
    }

    public String getRole() {
        return staffMember.getRole() != null ? staffMember.getRole().getName() : "NONE";
    }

    public StaffMember getStaffMember() {
        return staffMember;
    }
}
