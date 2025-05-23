package com.example.backend.controller;

import com.example.backend.entity.Panier;
import com.example.backend.entity.HistoriqueAction;
import com.example.backend.entity.User;
import com.example.backend.service.PanierService;
import com.example.backend.service.HistoriqueActionService;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/panier")
@PreAuthorize("isAuthenticated()")
public class PanierController {
    
    @Autowired
    private PanierService panierService;
    
    @Autowired
    private HistoriqueActionService historiqueActionService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping
    public ResponseEntity<Panier> getPanier() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.findByEmail(auth.getName());
        
        return ResponseEntity.ok(panierService.findByUserId(currentUser.getId()));
    }
    
    @PostMapping("/produits/{produitId}")
    public ResponseEntity<Panier> ajouterProduit(@PathVariable Long produitId, 
                                               @RequestParam(defaultValue = "1") Integer quantite) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.findByEmail(auth.getName());
        
        try {
            Panier panier = panierService.ajouterProduit(currentUser.getId(), produitId, quantite);
            
            // Enregistrer l'action dans l'historique
            HistoriqueAction historique = new HistoriqueAction();
            historique.setAction("Ajout du produit #" + produitId + " au panier (quantité: " + quantite + ")");
            historique.setUtilisateur(currentUser);
            historiqueActionService.create(historique);
            
            return ResponseEntity.ok(panier);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/produits/{produitId}")
    public ResponseEntity<Panier> supprimerProduit(@PathVariable Long produitId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.findByEmail(auth.getName());
        
        Panier panier = panierService.supprimerProduit(currentUser.getId(), produitId);
        
        // Enregistrer l'action dans l'historique
        HistoriqueAction historique = new HistoriqueAction();
        historique.setAction("Suppression du produit #" + produitId + " du panier");
        historique.setUtilisateur(currentUser);
        historiqueActionService.create(historique);
        
        return ResponseEntity.ok(panier);
    }
    
    @PutMapping("/produits/{produitId}")
    public ResponseEntity<Panier> mettreAJourQuantite(@PathVariable Long produitId,
                                                   @RequestParam Integer quantite) {
        if (quantite <= 0) {
            return ResponseEntity.badRequest().build();
        }
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.findByEmail(auth.getName());
        
        try {
            Panier panier = panierService.mettreAJourQuantite(currentUser.getId(), produitId, quantite);
            
            // Enregistrer l'action dans l'historique
            HistoriqueAction historique = new HistoriqueAction();
            historique.setAction("Mise à jour de la quantité du produit #" + produitId + " dans le panier (nouvelle quantité: " + quantite + ")");
            historique.setUtilisateur(currentUser);
            historiqueActionService.create(historique);
            
            return ResponseEntity.ok(panier);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping
    public ResponseEntity<Panier> viderPanier() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.findByEmail(auth.getName());
        
        Panier panier = panierService.viderPanier(currentUser.getId());
        
        // Enregistrer l'action dans l'historique
        HistoriqueAction historique = new HistoriqueAction();
        historique.setAction("Vidage du panier");
        historique.setUtilisateur(currentUser);
        historiqueActionService.create(historique);
        
        return ResponseEntity.ok(panier);
    }
}
