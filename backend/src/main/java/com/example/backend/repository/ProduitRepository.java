package com.example.backend.repository;

import com.example.backend.entity.Produit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProduitRepository extends JpaRepository<Produit, Long> {
    
    List<Produit> findByCategorieId(Long categorieId);
    
    List<Produit> findByNomContainingIgnoreCase(String nom);
    
    List<Produit> findByActifTrue();
}
