package com.example.backend.service;

import com.example.backend.entity.*;
import com.example.backend.repository.CommandeRepository;
import com.example.backend.repository.ProduitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommandeService {
    
    @Autowired
    private CommandeRepository commandeRepository;
    
    @Autowired
    private PanierService panierService;
    
    @Autowired
    private ProduitRepository produitRepository;
    
    @Autowired
    private UserService userService;
    
    public List<Commande> findAll() {
        return commandeRepository.findAll();
    }
    
    public Commande findById(Long id) {
        return commandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée avec l'ID: " + id));
    }
    
    public List<Commande> findByUserId(Long userId) {
        return commandeRepository.findByUserId(userId);
    }
    
    public List<Commande> findByStatut(Commande.StatutCommande statut) {
        return commandeRepository.findByStatut(statut);
    }
    
    @Transactional
    public Commande creerCommande(Long userId, AdresseLivraison adresse, InformationPaiement paiement) {
        User user = userService.findById(userId);
        Panier panier = panierService.findByUserId(userId);
        
        // Vérifier que le panier n'est pas vide
        if (panier.getLignes().isEmpty()) {
            throw new RuntimeException("Impossible de créer une commande avec un panier vide");
        }
        
        // Vérifier la disponibilité des produits
        for (LignePanier ligne : panier.getLignes()) {
            Produit produit = ligne.getProduit();
            if (produit.getStock() < ligne.getQuantite()) {
                throw new RuntimeException("Stock insuffisant pour le produit: " + produit.getNom());
            }
        }
        
        // Créer la commande
        Commande commande = new Commande();
        commande.setUser(user);
        commande.setAdresseLivraison(adresse);
        commande.setInformationPaiement(paiement);
        
        // Ajouter les produits du panier à la commande
        commande.ajouterDuPanier(panier);
        
        // Mettre à jour le stock des produits
        for (LignePanier ligne : panier.getLignes()) {
            Produit produit = ligne.getProduit();
            produit.setStock(produit.getStock() - ligne.getQuantite());
            produitRepository.save(produit);
        }
        
        // Enregistrer la commande
        Commande nouvelleCommande = commandeRepository.save(commande);
        
        // Vider le panier
        panierService.viderPanier(userId);
        
        return nouvelleCommande;
    }
    
    @Transactional
    public Commande updateStatut(Long id, Commande.StatutCommande statut) {
        Commande commande = findById(id);
        commande.setStatut(statut);
        
        // Si la commande est annulée, remettre les produits en stock
        if (statut == Commande.StatutCommande.ANNULEE) {
            for (LigneCommande ligne : commande.getLignes()) {
                Produit produit = ligne.getProduit();
                produit.setStock(produit.getStock() + ligne.getQuantite());
                produitRepository.save(produit);
            }
        }
        
        return commandeRepository.save(commande);
    }
}
