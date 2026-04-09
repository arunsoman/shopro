package mls.sho.dms.web.controller.floor;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.floor.*;
import mls.sho.dms.application.service.floor.FloorPlanService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/floor-plan")
@RequiredArgsConstructor
@Tag(name = "Floor Plan Layout", description = "Management of sections and table layout on the floor.")
public class FloorPlanController {

    private final FloorPlanService floorPlanService;

    // --- Sections ---
    
    @PostMapping("/sections")
    @ResponseStatus(HttpStatus.CREATED)
    public SectionResponse createSection(@Valid @RequestBody CreateSectionRequest request, Principal principal) {
        String user = principal != null ? principal.getName() : "system";
        return floorPlanService.createSection(request, user);
    }

    @GetMapping("/sections")
    public List<SectionResponse> getAllSections() {
        return floorPlanService.getAllSections();
    }

    // --- Tables ---

    @PostMapping("/tables")
    @ResponseStatus(HttpStatus.CREATED)
    public TableShapeResponse createTable(@Valid @RequestBody CreateTableShapeRequest request, Principal principal) {
        String user = principal != null ? principal.getName() : "system";
        return floorPlanService.createTable(request, user);
    }

    @PutMapping("/tables/{id}")
    public TableShapeResponse updateTable(@PathVariable UUID id, @Valid @RequestBody CreateTableShapeRequest request, Principal principal) {
        String user = principal != null ? principal.getName() : "system";
        return floorPlanService.updateTable(id, request, user);
    }

    @DeleteMapping("/tables/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTable(@PathVariable UUID id, Principal principal) {
        String user = principal != null ? principal.getName() : "system";
        floorPlanService.deleteTable(id, user);
    }

    @GetMapping("/tables")
    public List<TableShapeResponse> getAllTables() {
        return floorPlanService.getAllTables();
    }

    @PatchMapping("/tables/{id}/status")
    public TableShapeResponse updateTableStatus(
            @PathVariable UUID id,
            @RequestBody java.util.Map<String, String> body,
            Principal principal) {
        String user = principal != null ? principal.getName() : "system";
        return floorPlanService.updateTableStatus(id, body.get("status"), user);
    }

    @PatchMapping("/tables/{id}/position")
    public TableShapeResponse updateTablePosition(
            @PathVariable UUID id,
            @RequestBody java.util.Map<String, Integer> body,
            Principal principal) {
        String user = principal != null ? principal.getName() : "system";
        return floorPlanService.updateTablePosition(id, body.get("posX"), body.get("posY"), user);
    }

    @PostMapping("/reservations/sync-holds")
    public void syncReservationHolds() {
        floorPlanService.updateReservationHolds();
    }
}
