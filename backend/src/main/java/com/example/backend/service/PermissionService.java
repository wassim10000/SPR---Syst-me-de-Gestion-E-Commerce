package com.example.backend.service;

import com.example.backend.entity.Permission;
import com.example.backend.repository.PermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class PermissionService {

    @Autowired
    private PermissionRepository permissionRepository;

    public List<Permission> findAll() {
        return permissionRepository.findAll();
    }

    public Permission findById(Long id) {
        return permissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Permission non trouvée avec l'id: " + id));
    }

    public Permission create(Permission permission) {
        if (permissionRepository.existsByNom(permission.getNom())) {
            throw new RuntimeException("Une permission existe déjà avec ce nom");
        }
        return permissionRepository.save(permission);
    }

    public Permission update(Long id, Permission permissionDetails) {
        Permission permission = findById(id);
        permission.setNom(permissionDetails.getNom());
        permission.setDescription(permissionDetails.getDescription());
        return permissionRepository.save(permission);
    }

    public void delete(Long id) {
        Permission permission = findById(id);
        permissionRepository.delete(permission);
    }
} 