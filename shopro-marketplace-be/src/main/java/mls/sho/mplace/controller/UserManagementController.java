package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.dto.BuyerDto;
import mls.sho.mplace.dto.SupplierDto;
import mls.sho.mplace.service.UserManagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/operator/users")
@RequiredArgsConstructor
public class UserManagementController {

    private final UserManagementService userManagementService;

    @GetMapping("/buyers")
    public ResponseEntity<List<BuyerDto>> getBuyers() {
        return ResponseEntity.ok(userManagementService.getAllBuyers());
    }

    @GetMapping("/suppliers")
    public ResponseEntity<List<SupplierDto>> getSuppliers() {
        return ResponseEntity.ok(userManagementService.getAllSuppliers());
    }

    @PostMapping("/suppliers/{id}/verify")
    public ResponseEntity<Void> verifySupplier(@PathVariable UUID id) {
        userManagementService.verifySupplier(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/suppliers/{id}/reject")
    public ResponseEntity<Void> rejectSupplier(@PathVariable UUID id) {
        userManagementService.rejectSupplier(id);
        return ResponseEntity.ok().build();
    }
}
