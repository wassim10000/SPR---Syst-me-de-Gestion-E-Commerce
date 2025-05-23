package com.example.backend.repository;

import com.example.backend.entity.Categorie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategorieRepository extends JpaRepository<Categorie, Long> {
    
    Optional<Categorie> findByNom(String nom);
    
    boolean existsByNom(String nom);
}
