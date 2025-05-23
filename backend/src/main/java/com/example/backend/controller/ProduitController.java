package com.example.backend.controller;

import com.example.backend.entity.Produit;
import com.example.backend.service.ProduitService;
import com.example.backend.service.HistoriqueActionService;
import com.example.backend.entity.HistoriqueAction;
import com.example.backend.entity.User;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produits")
public class ProduitController {
    
    @Autowired
    private ProduitService produitService;
    
    @Autowired
    private HistoriqueActionService historiqueActionService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping
    public ResponseEntity<List<Produit>> getAllProduits() {
        return ResponseEntity.ok(produitService.findAllActifs());
    }
    
    @GetMapping("/admin")
    @PreAuthorize("hasAuthority('PRODUIT_READ') or hasAuthority('ADMIN')")
    public ResponseEntity<List<Produit>> getAllProduitsAdmin() {
        return ResponseEntity.ok(produitService.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Produit> getProduitById(@PathVariable Long id) {
        return ResponseEntity.ok(produitService.findById(id));
    }
    
    @GetMapping("/categorie/{categorieId}")
    public ResponseEntity<List<Produit>> getProduitsByCategorie(@PathVariable Long categorieId) {
        return ResponseEntity.ok(produitService.findByCategorie(categorieId));
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Produit>> searchProduits(@RequestParam String query) {
        return ResponseEntity.ok(produitService.findByNom(query));
    }
    
    @PostMapping
    @PreAuthorize("hasAuthority('PRODUIT_CREATE') or hasAuthority('ADMIN')")
    public ResponseEntity<Produit> createProduit(@RequestBody Produit produit, 
                                                @RequestParam(required = false) Long categorieId) {
        Produit nouveauProduit = produitService.create(produit, categorieId);
        
        // Enregistrer l'action dans l'historique
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.findByEmail(auth.getName());
        
        HistoriqueAction historique = new HistoriqueAction();
        historique.setAction("Création du produit: " + nouveauProduit.getNom());
        historique.setUtilisateur(currentUser);
        historiqueActionService.create(historique);
        
        return ResponseEntity.ok(nouveauProduit);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUIT_UPDATE') or hasAuthority('ADMIN')")
    public ResponseEntity<Produit> updateProduit(@PathVariable Long id, 
                                               @RequestBody Produit produitDetails,
                                               @RequestParam(required = false) Long categorieId) {
        Produit updatedProduit = produitService.update(id, produitDetails, categorieId);
        
        // Enregistrer l'action dans l'historique
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.findByEmail(auth.getName());
        
        HistoriqueAction historique = new HistoriqueAction();
        historique.setAction("Mise à jour du produit: " + updatedProduit.getNom());
        historique.setUtilisateur(currentUser);
        historiqueActionService.create(historique);
        
        return ResponseEntity.ok(updatedProduit);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUIT_DELETE') or hasAuthority('ADMIN')")
    public ResponseEntity<?> deleteProduit(@PathVariable Long id) {
        Produit produit = produitService.findById(id);
        String nomProduit = produit.getNom();
        
        produitService.delete(id);
        
        // Enregistrer l'action dans l'historique
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.findByEmail(auth.getName());
        
        HistoriqueAction historique = new HistoriqueAction();
        historique.setAction("Suppression du produit: " + nomProduit);
        historique.setUtilisateur(currentUser);
        historiqueActionService.create(historique);
        
        return ResponseEntity.ok().build();
    }
    
    @PatchMapping("/{id}/active")
    @PreAuthorize("hasAuthority('PRODUIT_UPDATE') or hasAuthority('ADMIN')")
    public ResponseEntity<Produit> toggleProductActive(@PathVariable Long id) {
        Produit produit = produitService.toggleActive(id);
        
        // Enregistrer l'action dans l'historique
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.findByEmail(auth.getName());
        
        String action = produit.isActif() ? "Activation" : "Désactivation";
        
        HistoriqueAction historique = new HistoriqueAction();
        historique.setAction(action + " du produit: " + produit.getNom());
        historique.setUtilisateur(currentUser);
        historiqueActionService.create(historique);
        
        return ResponseEntity.ok(produit);
    }
    
    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasAuthority('PRODUIT_UPDATE') or hasAuthority('ADMIN')")
    public ResponseEntity<Produit> updateStock(@PathVariable Long id, @RequestParam Integer quantite) {
        Produit produit = produitService.updateStock(id, quantite);
        
        // Enregistrer l'action dans l'historique
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.findByEmail(auth.getName());
        
        HistoriqueAction historique = new HistoriqueAction();
        historique.setAction("Mise à jour du stock du produit: " + produit.getNom() + " (" + quantite + ")");
        historique.setUtilisateur(currentUser);
        historiqueActionService.create(historique);
        
        return ResponseEntity.ok(produit);
    }
}
