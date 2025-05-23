package com.example.backend.controller;

import com.example.backend.entity.HistoriqueAction;
import com.example.backend.entity.User;
import com.example.backend.service.HistoriqueActionService;
import com.example.backend.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/historique")
public class HistoriqueActionController {

    private static final Logger logger = LoggerFactory.getLogger(HistoriqueActionController.class);

    @Autowired
    private HistoriqueActionService historiqueActionService;
    
    @Autowired
    private UserService userService;

    /**
     * Récupère tous les historiques ou uniquement ceux de l'utilisateur connecté
     * Les admin et RH voient tous les historiques, les autres utilisateurs ne voient que les leurs
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<HistoriqueAction>> getAllHistoriqueActions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User currentUser = userService.findByEmail(email);
        
        // Vérifier si l'utilisateur a le rôle ADMIN ou RH
        boolean isAdminOrRH = currentUser.getRoles().stream()
            .anyMatch(role -> role.getNom().equals("ADMIN") || role.getNom().equals("RH"));
        
        logger.info("Accès aux historiques demandé par {} (admin/RH: {})", email, isAdminOrRH);
        
        // Si admin ou RH, retourner tous les historiques, sinon seulement ceux de l'utilisateur
        if (isAdminOrRH) {
            return ResponseEntity.ok(historiqueActionService.findAll());
        } else {
            return ResponseEntity.ok(historiqueActionService.findByUtilisateurId(currentUser.getId()));
        }
    }

    /**
     * Récupère un historique spécifique par ID
     * Les admin et RH peuvent voir n'importe quel historique, les autres utilisateurs seulement les leurs
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<HistoriqueAction> getHistoriqueActionById(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User currentUser = userService.findByEmail(email);
        
        HistoriqueAction historique = historiqueActionService.findById(id);
        
        // Vérifier si l'utilisateur a le rôle ADMIN ou RH ou s'il est le propriétaire de l'historique
        boolean isAdminOrRH = currentUser.getRoles().stream()
            .anyMatch(role -> role.getNom().equals("ADMIN") || role.getNom().equals("RH"));
        boolean isOwner = historique.getUtilisateur().getId().equals(currentUser.getId());
        
        if (isAdminOrRH || isOwner) {
            return ResponseEntity.ok(historique);
        } else {
            return ResponseEntity.status(403).build(); // Forbidden
        }
    }

    /**
     * Récupère les historiques d'un utilisateur spécifique
     * Les admin et RH peuvent voir les historiques de n'importe quel utilisateur,
     * les autres utilisateurs seulement les leurs
     */
    @GetMapping("/utilisateur/{utilisateurId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<HistoriqueAction>> getHistoriqueActionsByUtilisateur(@PathVariable Long utilisateurId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User currentUser = userService.findByEmail(email);
        
        // Vérifier si l'utilisateur a le rôle ADMIN ou RH ou s'il est l'utilisateur demandé
        boolean isAdminOrRH = currentUser.getRoles().stream()
            .anyMatch(role -> role.getNom().equals("ADMIN") || role.getNom().equals("RH"));
        boolean isSameUser = currentUser.getId().equals(utilisateurId);
        
        if (isAdminOrRH || isSameUser) {
            return ResponseEntity.ok(historiqueActionService.findByUtilisateurId(utilisateurId));
        } else {
            return ResponseEntity.status(403).build(); // Forbidden
        }
    }

    /**
     * Crée un nouvel historique d'action
     * Tous les utilisateurs authentifiés peuvent créer un historique pour eux-mêmes
     * Les admin et RH peuvent créer un historique pour n'importe quel utilisateur
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<HistoriqueAction> createHistoriqueAction(@RequestBody HistoriqueAction historiqueAction) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User currentUser = userService.findByEmail(email);
        
        // Vérifier si l'utilisateur a le rôle ADMIN ou RH ou s'il crée un historique pour lui-même
        boolean isAdminOrRH = currentUser.getRoles().stream()
            .anyMatch(role -> role.getNom().equals("ADMIN") || role.getNom().equals("RH"));
        boolean isForSelf = historiqueAction.getUtilisateur() != null && 
                          historiqueAction.getUtilisateur().getId().equals(currentUser.getId());
        
        if (isAdminOrRH || isForSelf) {
            return ResponseEntity.ok(historiqueActionService.create(historiqueAction));
        } else {
            // Si ce n'est pas un admin/RH et qu'il essaie de créer un historique pour quelqu'un d'autre
            return ResponseEntity.status(403).build(); // Forbidden
        }
    }

    /**
     * Supprime un historique d'action
     * Seuls les admin et RH peuvent supprimer des historiques
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteHistoriqueAction(@PathVariable Long id) {
        logger.info("Suppression de l'historique d'action {}", id);
        historiqueActionService.delete(id);
        return ResponseEntity.ok().build();
    }
}