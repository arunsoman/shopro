package mls.sho.dms.web.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.menu.ModifierGroupDTOs.CreateModifierGroupRequest;
import mls.sho.dms.application.dto.menu.ModifierGroupDTOs.ModifierGroupResponse;
import mls.sho.dms.application.service.menu.ModifierGroupService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/modifier-groups")
@RequiredArgsConstructor
@Tag(name = "Modifier Groups", description = "Endpoints for managing menu item modifier groups and options")
public class ModifierGroupController {

    private final ModifierGroupService modifierGroupService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ModifierGroupResponse create(
        @Valid @RequestBody CreateModifierGroupRequest request,
        @RequestHeader(value = "X-User-Id", defaultValue = "system") String username
    ) {
        // Fallback username for local testing if security is disabled
        String actor = (username != null && !username.isEmpty()) ? username : "system";
        return modifierGroupService.create(request, actor);
    }

    @GetMapping("/{id}")
    public ModifierGroupResponse findById(@PathVariable UUID id) {
        return modifierGroupService.findById(id);
    }

    @GetMapping
    public List<ModifierGroupResponse> findAll() {
        return modifierGroupService.findAll();
    }
}
