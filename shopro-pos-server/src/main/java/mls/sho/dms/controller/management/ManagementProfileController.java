package mls.sho.dms.controller.management;

import mls.sho.dms.entity.management.ManagementProfile;
import mls.sho.dms.service.management.ManagementProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/management/profile")
public class ManagementProfileController {

    private final ManagementProfileService service;

    public ManagementProfileController(ManagementProfileService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ManagementProfile> getProfile() {
        return service.getProfile()
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping
    public ResponseEntity<ManagementProfile> saveProfile(@RequestBody ManagementProfile profile) {
        return ResponseEntity.ok(service.saveProfile(profile));
    }
}
