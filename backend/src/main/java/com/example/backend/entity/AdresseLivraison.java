package com.example.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdresseLivraison {

    @Column(nullable = false)
    private String nom;
    
    @Column(nullable = false)
    private String prenom;
    
    @Column(nullable = false)
    private String adresse;
    
    @Column(nullable = false)
    private String ville;
    
    @Column(nullable = false)
    private String codePostal;
    
    @Column(nullable = false)
    private String pays;
    
    private String telephone;
    
    private String informationsComplementaires;
}
