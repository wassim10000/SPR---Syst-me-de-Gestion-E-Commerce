package com.example.backend.controller;

import com.example.backend.entity.Categorie;
import com.example.backend.entity.HistoriqueAction;
import com.example.backend.entity.User;
import com.example.backend.service.CategorieService;
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
@RequestMapping("/api/categories")
public class CategorieController {
    
    @Autowired
    private CategorieService categorieService;
    
    @Autowired
    private HistoriqueActionService historiqueActionService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping
    public ResponseEntity<List<Categorie>> getAllCategories() {
        return ResponseEntity.ok(categorieService.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Categorie> getCategorieById(@PathVariable Long id) {
        return ResponseEntity.ok(categorieService.findById(id));
    }
    
    @PostMapping
    @PreAuthorize("hasAuthority('CATEGORIE_CREATE') or hasAuthority('ADMIN')")
    public ResponseEntity<Categorie> createCategorie(@RequestBody Categorie categorie) {
        Categorie nouvelleCategorie = categorieService.create(categorie);
        
        // Enregistrer l'action dans l'historique
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.findByEmail(auth.getName());
        
        HistoriqueAction historique = new HistoriqueAction();
        historique.setAction("Création de la catégorie: " + nouvelleCategorie.getNom());
        historique.setUtilisateur(currentUser);
        historiqueActionService.create(historique);
        
        return ResponseEntity.ok(nouvelleCategorie);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CATEGORIE_UPDATE') or hasAuthority('ADMIN')")
    public ResponseEntity<Categorie> updateCategorie(@PathVariable Long id, @RequestBody Categorie categorieDetails) {
        Categorie updatedCategorie = categorieService.update(id, categorieDetails);
        
        // Enregistrer l'action dans l'historique
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.findByEmail(auth.getName());
        
        HistoriqueAction historique = new HistoriqueAction();
        historique.setAction("Mise à jour de la catégorie: " + updatedCategorie.getNom());
        historique.setUtilisateur(currentUser);
        historiqueActionService.create(historique);
        
        return ResponseEntity.ok(updatedCategorie);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('CATEGORIE_DELETE') or hasAuthority('ADMIN')")
    public ResponseEntity<?> deleteCategorie(@PathVariable Long id) {
        Categorie categorie = categorieService.findById(id);
        String nomCategorie = categorie.getNom();
        
        try {
            categorieService.delete(id);
            
            // Enregistrer l'action dans l'historique
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = userService.findByEmail(auth.getName());
            
            HistoriqueAction historique = new HistoriqueAction();
            historique.setAction("Suppression de la catégorie: " + nomCategorie);
            historique.setUtilisateur(currentUser);
            historiqueActionService.create(historique);
            
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
