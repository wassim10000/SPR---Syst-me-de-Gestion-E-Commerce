package com.example.backend.repository;

import com.example.backend.entity.Commande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommandeRepository extends JpaRepository<Commande, Long> {
    
    List<Commande> findByUserId(Long userId);
    
    List<Commande> findByStatut(Commande.StatutCommande statut);
}
