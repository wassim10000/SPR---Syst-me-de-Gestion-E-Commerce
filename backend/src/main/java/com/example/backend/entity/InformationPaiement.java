package com.example.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InformationPaiement {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MethodePaiement methode;
    
    private String referenceTransaction;
    
    private LocalDateTime datePaiement;
    
    @Column(name = "statut_paiement")
    private String statut;
    
    // Types de méthodes de paiement
    public enum MethodePaiement {
        CARTE_CREDIT,
        PAYPAL,
        VIREMENT_BANCAIRE,
        PAIEMENT_A_LA_LIVRAISON
    }
}
