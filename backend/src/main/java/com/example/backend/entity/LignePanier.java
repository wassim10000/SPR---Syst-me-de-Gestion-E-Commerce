package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "lignes_panier")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LignePanier {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "panier_id", nullable = false)
    @JsonBackReference
    private Panier panier;
    
    @ManyToOne
    @JoinColumn(name = "produit_id", nullable = false)
    private Produit produit;
    
    @Column(nullable = false)
    private Integer quantite = 1;
    
    @Column(nullable = false)
    private BigDecimal prix;
    
    @Column(nullable = false)
    private BigDecimal sousTotal;
}
