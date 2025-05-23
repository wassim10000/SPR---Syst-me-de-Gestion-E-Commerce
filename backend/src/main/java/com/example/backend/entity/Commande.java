package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonIdentityReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "commandes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Commande {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIdentityReference(alwaysAsId = true)
    private User user;
    
    @Column(nullable = false)
    private LocalDateTime dateCommande = LocalDateTime.now();
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutCommande statut = StatutCommande.EN_ATTENTE;
    
    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<LigneCommande> lignes = new ArrayList<>();
    
    @Column(nullable = false)
    private BigDecimal total = BigDecimal.ZERO;
    
    @Embedded
    private AdresseLivraison adresseLivraison;
    
    @Embedded
    private InformationPaiement informationPaiement;
    
    // Méthode pour ajouter des lignes depuis un panier
    public void ajouterDuPanier(Panier panier) {
        for (LignePanier lignePanier : panier.getLignes()) {
            LigneCommande ligne = new LigneCommande();
            ligne.setCommande(this);
            ligne.setProduit(lignePanier.getProduit());
            ligne.setQuantite(lignePanier.getQuantite());
            ligne.setPrix(lignePanier.getPrix());
            ligne.setSousTotal(lignePanier.getSousTotal());
            lignes.add(ligne);
        }
        recalculerTotal();
    }
    
    // Méthode pour recalculer le total
    private void recalculerTotal() {
        total = BigDecimal.ZERO;
        for (LigneCommande ligne : lignes) {
            total = total.add(ligne.getSousTotal());
        }
    }
    
    // Enums pour les statuts de commande
    public enum StatutCommande {
        EN_ATTENTE,
        PAYEE,
        EN_PREPARATION,
        EXPEDIEE,
        LIVREE,
        ANNULEE
    }
}
