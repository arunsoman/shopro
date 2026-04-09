package mls.sho.dms.application.controller.inventory;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.inventory.InviteSupplierUserRequest;
import mls.sho.dms.application.dto.inventory.SupplierUserResponse;
import mls.sho.dms.application.service.inventory.SupplierUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/suppliers/{supplierId}/users")
@RequiredArgsConstructor
public class SupplierUserController {

    private final SupplierUserService userService;

    @PostMapping("/invite")
    public ResponseEntity<SupplierUserResponse> inviteUser(
            @PathVariable UUID supplierId,
            @RequestBody InviteSupplierUserRequest request) {
        return ResponseEntity.ok(userService.inviteUser(supplierId, request));
    }

    @GetMapping
    public ResponseEntity<List<SupplierUserResponse>> getSupplierUsers(@PathVariable UUID supplierId) {
        return ResponseEntity.ok(userService.getSupplierUsers(supplierId));
    }

    @PatchMapping("/{userId}/deactivate")
    public ResponseEntity<Void> deactivateUser(@PathVariable UUID supplierId, @PathVariable UUID userId) {
        userService.deactivateUser(userId);
        return ResponseEntity.ok().build();
    }
}
