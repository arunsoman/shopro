package mls.sho.dms.application.service.inventory;

import mls.sho.dms.application.dto.inventory.InviteSupplierUserRequest;
import mls.sho.dms.application.dto.inventory.SupplierUserResponse;

import java.util.List;
import java.util.UUID;

public interface SupplierUserService {
    SupplierUserResponse inviteUser(UUID supplierId, InviteSupplierUserRequest request);
    List<SupplierUserResponse> getSupplierUsers(UUID supplierId);
    void deactivateUser(UUID userId);
}
