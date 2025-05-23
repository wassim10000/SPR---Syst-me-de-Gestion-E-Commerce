package com.example.backend.controller;

import com.example.backend.entity.Permission;
import com.example.backend.service.PermissionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
public class PermissionController {

    @Autowired
    private PermissionService permissionService;
    
    private static final Logger logger = LoggerFactory.getLogger(PermissionController.class);

    @GetMapping
    @PreAuthorize("hasAuthority('PERMISSION_READ')")
    public ResponseEntity<List<Permission>> getAllPermissions() {
        logger.info("Récupération de toutes les permissions");
        return ResponseEntity.ok(permissionService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_READ')")
    public ResponseEntity<Permission> getPermissionById(@PathVariable Long id) {
        logger.info("Récupération de la permission avec l'id: {}", id);
        return ResponseEntity.ok(permissionService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PERMISSION_CREATE')")
    public ResponseEntity<Permission> createPermission(@RequestBody Permission permission) {
        logger.info("Création d'une nouvelle permission: {}", permission.getNom());
        return ResponseEntity.ok(permissionService.create(permission));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_UPDATE')")
    public ResponseEntity<Permission> updatePermission(@PathVariable Long id, @RequestBody Permission permissionDetails) {
        logger.info("Mise à jour de la permission avec l'id: {}", id);
        return ResponseEntity.ok(permissionService.update(id, permissionDetails));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_DELETE')")
    public ResponseEntity<?> deletePermission(@PathVariable Long id) {
        logger.info("Suppression de la permission avec l'id: {}", id);
        permissionService.delete(id);
        return ResponseEntity.ok().build();
    }
}