package com.example.backend.controller;

import com.example.backend.entity.*;
import com.example.backend.service.CommandeService;
import com.example.backend.service.HistoriqueActionService;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/commandes")
@PreAuthorize("isAuthenticated()")
public class CommandeController {
    
    @Autowired
    private CommandeService commandeService;
    
    @Autowired
    private HistoriqueActionService historiqueActionService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping
    public ResponseEntity<List<Commande>> getMesCommandes() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.findByEmail(auth.getName());
        
        return ResponseEntity.ok(commandeService.findByUserId(currentUser.getId()));
    }
    
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('COMMANDE_READ') or hasAuthority('ADMIN')")
    public ResponseEntity<List<Commande>> getAllCommandes() {
        return ResponseEntity.ok(commandeService.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Commande> getCommandeById(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.findByEmail(auth.getName());
        Commande commande = commandeService.findById(id);
        
        // Vérifier si l'utilisateur a le droit de voir cette commande
        boolean isAdmin = currentUser.getRoles().stream()
            .anyMatch(role -> role.getNom().equals("ADMIN") || role.getNom().equals("VENDEUR"));
            
        if (!isAdmin && !commande.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).build(); // Forbidden
        }
        
        return ResponseEntity.ok(commande);
    }
    
    @GetMapping("/statut/{statut}")
    @PreAuthorize("hasAuthority('COMMANDE_READ') or hasAuthority('ADMIN')")
    public ResponseEntity<List<Commande>> getCommandesByStatut(
            @PathVariable Commande.StatutCommande statut) {
        return ResponseEntity.ok(commandeService.findByStatut(statut));
    }
    
    @PostMapping
    public ResponseEntity<Commande> createCommande(
            @RequestBody CreateCommandeRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.findByEmail(auth.getName());
        
        try {
            Commande commande = commandeService.creerCommande(
                currentUser.getId(), 
                request.getAdresseLivraison(), 
                request.getInformationPaiement()
            );
            
            // Enregistrer l'action dans l'historique
            HistoriqueAction historique = new HistoriqueAction();
            historique.setAction("Création d'une nouvelle commande #" + commande.getId());
            historique.setUtilisateur(currentUser);
            historiqueActionService.create(historique);
            
            return ResponseEntity.ok(commande);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PatchMapping("/{id}/statut")
    @PreAuthorize("hasAuthority('COMMANDE_UPDATE') or hasAuthority('ADMIN')")
    public ResponseEntity<Commande> updateStatutCommande(
            @PathVariable Long id, 
            @RequestParam Commande.StatutCommande statut) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.findByEmail(auth.getName());
        
        Commande commande = commandeService.updateStatut(id, statut);
        
        // Enregistrer l'action dans l'historique
        HistoriqueAction historique = new HistoriqueAction();
        historique.setAction("Mise à jour du statut de la commande #" + id + " à " + statut.name());
        historique.setUtilisateur(currentUser);
        historiqueActionService.create(historique);
        
        return ResponseEntity.ok(commande);
    }
    
    // Classe pour la requête de création de commande
    public static class CreateCommandeRequest {
        private AdresseLivraison adresseLivraison;
        private InformationPaiement informationPaiement;
        
        public AdresseLivraison getAdresseLivraison() {
            return adresseLivraison;
        }
        
        public void setAdresseLivraison(AdresseLivraison adresseLivraison) {
            this.adresseLivraison = adresseLivraison;
        }
        
        public InformationPaiement getInformationPaiement() {
            return informationPaiement;
        }
        
        public void setInformationPaiement(InformationPaiement informationPaiement) {
            this.informationPaiement = informationPaiement;
        }
    }
}
