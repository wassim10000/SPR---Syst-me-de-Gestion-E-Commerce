package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "paniers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Panier {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @OneToMany(mappedBy = "panier", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<LignePanier> lignes = new ArrayList<>();
    
    @Column(nullable = false)
    private BigDecimal total = BigDecimal.ZERO;
    
    // Méthode pour ajouter un produit au panier
    public void ajouterProduit(Produit produit, int quantite) {
        // Vérifier si le produit est déjà dans le panier
        for (LignePanier ligne : lignes) {
            if (ligne.getProduit().getId().equals(produit.getId())) {
                // Mettre à jour la quantité existante
                ligne.setQuantite(ligne.getQuantite() + quantite);
                // Mettre à jour le sous-total
                ligne.setSousTotal(ligne.getProduit().getPrix().multiply(new BigDecimal(ligne.getQuantite())));
                recalculerTotal();
                return;
            }
        }
        
        // Ajouter un nouveau produit
        LignePanier nouvelleLigne = new LignePanier();
        nouvelleLigne.setPanier(this);
        nouvelleLigne.setProduit(produit);
        nouvelleLigne.setQuantite(quantite);
        nouvelleLigne.setPrix(produit.getPrix());
        nouvelleLigne.setSousTotal(produit.getPrix().multiply(new BigDecimal(quantite)));
        lignes.add(nouvelleLigne);
        
        recalculerTotal();
    }
    
    // Méthode pour supprimer un produit du panier
    public void supprimerProduit(Long produitId) {
        lignes.removeIf(ligne -> ligne.getProduit().getId().equals(produitId));
        recalculerTotal();
    }
    
    // Méthode pour mettre à jour la quantité d'un produit
    public void mettreAJourQuantite(Long produitId, int quantite) {
        for (LignePanier ligne : lignes) {
            if (ligne.getProduit().getId().equals(produitId)) {
                ligne.setQuantite(quantite);
                ligne.setSousTotal(ligne.getProduit().getPrix().multiply(new BigDecimal(quantite)));
                recalculerTotal();
                return;
            }
        }
    }
    
    // Méthode pour vider le panier
    public void vider() {
        lignes.clear();
        total = BigDecimal.ZERO;
    }
    
    // Méthode pour recalculer le total du panier
    private void recalculerTotal() {
        total = BigDecimal.ZERO;
        for (LignePanier ligne : lignes) {
            total = total.add(ligne.getSousTotal());
        }
    }
}
