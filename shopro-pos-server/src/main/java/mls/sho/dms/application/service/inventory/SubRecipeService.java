package mls.sho.dms.application.service.inventory;

import mls.sho.dms.application.dto.inventory.SubRecipeResponse;
import java.util.List;
import java.util.UUID;

public interface SubRecipeService {
    List<SubRecipeResponse> findAll();
    SubRecipeResponse findById(UUID id);
}
