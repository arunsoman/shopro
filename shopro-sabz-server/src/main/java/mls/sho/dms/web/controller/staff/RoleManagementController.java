package mls.sho.dms.web.controller.staff;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.staff.RoleRequest;
import mls.sho.dms.application.dto.staff.RoleResponse;
import mls.sho.dms.application.dto.staff.PermissionResponse;
import mls.sho.dms.repository.staff.PermissionRepository;
import mls.sho.dms.repository.staff.RoleRepository;
import mls.sho.dms.entity.staff.Role;
import mls.sho.dms.entity.staff.Permission;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
public class RoleManagementController {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @GetMapping
    public List<RoleResponse> listRoles() {
        return roleRepository.findAll().stream()
                .map(this::toRoleResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/permissions")
    public List<PermissionResponse> listPermissions() {
        return permissionRepository.findAll().stream()
                .map(p -> new PermissionResponse(p.getId(), p.getName(), p.getDescription(), p.getCategory().name()))
                .collect(Collectors.toList());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoleResponse createRole(@RequestBody RoleRequest request) {
        Role role = new Role();
        role.setName(request.name().toUpperCase());
        role.setDescription(request.description());
        
        if (request.permissions() != null) {
            List<Permission> perms = permissionRepository.findAll().stream()
                .filter(p -> request.permissions().contains(p.getName()))
                .collect(Collectors.toList());
            role.setPermissions(new java.util.HashSet<>(perms));
        }

        if (request.parentRoleId() != null) {
            roleRepository.findById(request.parentRoleId()).ifPresent(role::setParentRole);
        }

        return toRoleResponse(roleRepository.save(role));
    }

    @PutMapping("/{id}")
    public RoleResponse updateRole(@PathVariable UUID id, @RequestBody RoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Role not found"));
        
        role.setName(request.name().toUpperCase());
        role.setDescription(request.description());

        if (request.permissions() != null) {
            List<Permission> perms = permissionRepository.findAll().stream()
                .filter(p -> request.permissions().contains(p.getName()))
                .collect(Collectors.toList());
            role.setPermissions(new java.util.HashSet<>(perms));
        }

        if (request.parentRoleId() != null) {
            roleRepository.findById(request.parentRoleId()).ifPresent(role::setParentRole);
        } else {
            role.setParentRole(null);
        }

        return toRoleResponse(roleRepository.save(role));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRole(@PathVariable UUID id) {
        roleRepository.deleteById(id);
    }

    private RoleResponse toRoleResponse(Role role) {
        return new RoleResponse(
                role.getId(),
                role.getName(),
                role.getDescription(),
                role.getPermissions().stream().map(Permission::getName).collect(Collectors.toList()),
                role.getParentRole() != null ? role.getParentRole().getId() : null
        );
    }
}
