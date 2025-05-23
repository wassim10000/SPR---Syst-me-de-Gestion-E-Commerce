package com.example.backend.repository;

import com.example.backend.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface PermissionRepository extends JpaRepository<Permission, Long> {
    Optional<Permission> findByNom(String nom);
    boolean existsByNom(String nom);
    
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO permissions (nom, description) VALUES (:nom, :description) ON CONFLICT (nom) DO NOTHING", nativeQuery = true)
    void createPermission(@Param("nom") String nom, @Param("description") String description);
}