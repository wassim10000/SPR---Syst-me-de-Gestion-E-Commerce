package com.example.backend.controller;

import com.example.backend.entity.Role;
import com.example.backend.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleController {
    private static final Logger logger = LoggerFactory.getLogger(RoleController.class);

    @Autowired
    private RoleService roleService;

    /**
     * Get all roles
     * @return List of all roles
     */
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_READ') or hasAuthority('ADMIN')")
    public ResponseEntity<List<Role>> getAllRoles() {
        logger.info("Fetching all roles");
        return ResponseEntity.ok(roleService.findAll());
    }

    /**
     * Get role by ID
     * @param id Role ID
     * @return Role with the specified ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_READ') or hasAuthority('ADMIN')")
    public ResponseEntity<Role> getRoleById(@PathVariable Long id) {
        logger.info("Fetching role with id: {}", id);
        return ResponseEntity.ok(roleService.findById(id));
    }

    /**
     * Create a new role
     * @param role Role data
     * @return Created role
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_CREATE') or hasAuthority('ADMIN')")
    public ResponseEntity<Role> createRole(@RequestBody Role role) {
        logger.info("Creating new role with name: {}", role.getNom());
        return new ResponseEntity<>(roleService.create(role), HttpStatus.CREATED);
    }

    /**
     * Update an existing role
     * @param id Role ID
     * @param roleDetails Updated role data
     * @return Updated role
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_UPDATE') or hasAuthority('ADMIN')")
    public ResponseEntity<Role> updateRole(@PathVariable Long id, @RequestBody Role roleDetails) {
        logger.info("Updating role with id: {}", id);
        return ResponseEntity.ok(roleService.update(id, roleDetails));
    }

    /**
     * Delete a role
     * @param id Role ID
     * @return No content response
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_DELETE') or hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        logger.info("Deleting role with id: {}", id);
        roleService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Add a permission to a role
     * @param roleId Role ID
     * @param permissionId Permission ID
     * @return Updated role
     */
    @PostMapping("/{roleId}/permissions/{permissionId}")
    @PreAuthorize("hasAuthority('ROLE_UPDATE') or hasAuthority('ADMIN')")
    public ResponseEntity<Role> addPermissionToRole(@PathVariable Long roleId, @PathVariable Long permissionId) {
        logger.info("Adding permission {} to role {}", permissionId, roleId);
        return ResponseEntity.ok(roleService.addPermission(roleId, permissionId));
    }

    /**
     * Remove a permission from a role
     * @param roleId Role ID
     * @param permissionId Permission ID
     * @return Updated role
     */
    @DeleteMapping("/{roleId}/permissions/{permissionId}")
    @PreAuthorize("hasAuthority('ROLE_UPDATE') or hasAuthority('ADMIN')")
    public ResponseEntity<Role> removePermissionFromRole(@PathVariable Long roleId, @PathVariable Long permissionId) {
        logger.info("Removing permission {} from role {}", permissionId, roleId);
        return ResponseEntity.ok(roleService.removePermission(roleId, permissionId));
    }
}