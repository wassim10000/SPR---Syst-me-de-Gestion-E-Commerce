package com.example.backend.service;

import com.example.backend.entity.Panier;
import com.example.backend.entity.Produit;
import com.example.backend.entity.User;
import com.example.backend.repository.PanierRepository;
import com.example.backend.repository.ProduitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PanierService {
    
    @Autowired
    private PanierRepository panierRepository;
    
    @Autowired
    private ProduitRepository produitRepository;
    
    @Autowired
    private UserService userService;
    
    public Panier findByUserId(Long userId) {
        return panierRepository.findByUserId(userId)
                .orElseGet(() -> {
                    // Créer un nouveau panier pour l'utilisateur
                    User user = userService.findById(userId);
                    Panier panier = new Panier();
                    panier.setUser(user);
                    return panierRepository.save(panier);
                });
    }
    
    @Transactional
    public Panier ajouterProduit(Long userId, Long produitId, Integer quantite) {
        Panier panier = findByUserId(userId);
        Produit produit = produitRepository.findById(produitId)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé avec l'ID: " + produitId));
                
        // Vérifier si le produit est en stock
        if (produit.getStock() < quantite) {
            throw new RuntimeException("Stock insuffisant pour le produit: " + produit.getNom());
        }
        
        panier.ajouterProduit(produit, quantite);
        return panierRepository.save(panier);
    }
    
    @Transactional
    public Panier supprimerProduit(Long userId, Long produitId) {
        Panier panier = findByUserId(userId);
        panier.supprimerProduit(produitId);
        return panierRepository.save(panier);
    }
    
    @Transactional
    public Panier mettreAJourQuantite(Long userId, Long produitId, Integer quantite) {
        Panier panier = findByUserId(userId);
        
        // Vérifier si le produit est en stock
        Produit produit = produitRepository.findById(produitId)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé avec l'ID: " + produitId));
                
        if (produit.getStock() < quantite) {
            throw new RuntimeException("Stock insuffisant pour le produit: " + produit.getNom());
        }
        
        panier.mettreAJourQuantite(produitId, quantite);
        return panierRepository.save(panier);
    }
    
    @Transactional
    public Panier viderPanier(Long userId) {
        Panier panier = findByUserId(userId);
        panier.vider();
        return panierRepository.save(panier);
    }
}
