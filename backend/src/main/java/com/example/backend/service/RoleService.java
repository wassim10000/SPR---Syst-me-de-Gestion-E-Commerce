package com.example.backend.service;

import com.example.backend.entity.Permission;
import com.example.backend.entity.Role;
import com.example.backend.repository.PermissionRepository;
import com.example.backend.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RoleService {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    public List<Role> findAll() {
        return roleRepository.findAll();
    }

    public Role findById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rôle non trouvé avec l'id: " + id));
    }

    public Role create(Role role) {
        if (roleRepository.existsByNom(role.getNom())) {
            throw new RuntimeException("Un rôle existe déjà avec ce nom");
        }
        return roleRepository.save(role);
    }

    public Role update(Long id, Role roleDetails) {
        Role role = findById(id);
        role.setNom(roleDetails.getNom());
        role.setDescription(roleDetails.getDescription());
        return roleRepository.save(role);
    }

    public void delete(Long id) {
        Role role = findById(id);
        roleRepository.delete(role);
    }

    public Role addPermission(Long roleId, Long permissionId) {
        Role role = findById(roleId);
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new RuntimeException("Permission non trouvée avec l'id: " + permissionId));
        
        role.getPermissions().add(permission);
        return roleRepository.save(role);
    }

    public Role removePermission(Long roleId, Long permissionId) {
        Role role = findById(roleId);
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new RuntimeException("Permission non trouvée avec l'id: " + permissionId));
        
        role.getPermissions().remove(permission);
        return roleRepository.save(role);
    }

    public Optional<Role> findByNom(String nom) {
        return roleRepository.findByNom(nom);
    }

    public Role createAdminRole() {
        Role adminRole = new Role();
        adminRole.setNom("ADMIN");
        adminRole.setDescription("Rôle administrateur avec tous les droits");
        return roleRepository.save(adminRole);
    }
} 