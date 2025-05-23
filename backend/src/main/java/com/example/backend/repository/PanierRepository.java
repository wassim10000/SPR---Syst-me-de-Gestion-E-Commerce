package com.example.backend.repository;

import com.example.backend.entity.Panier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PanierRepository extends JpaRepository<Panier, Long> {
    
    Optional<Panier> findByUserId(Long userId);
}
