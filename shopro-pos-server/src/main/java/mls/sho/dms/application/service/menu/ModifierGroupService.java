package mls.sho.dms.application.service.menu;

import mls.sho.dms.application.dto.menu.ModifierGroupDTOs.CreateModifierGroupRequest;
import mls.sho.dms.application.dto.menu.ModifierGroupDTOs.ModifierGroupResponse;

import java.util.List;
import java.util.UUID;

public interface ModifierGroupService {
    ModifierGroupResponse create(CreateModifierGroupRequest request, String performedBy);
    ModifierGroupResponse findById(UUID id);
    List<ModifierGroupResponse> findAll();
}
