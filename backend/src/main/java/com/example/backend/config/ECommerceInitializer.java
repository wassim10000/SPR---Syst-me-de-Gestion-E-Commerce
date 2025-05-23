package com.example.backend.config;

import com.example.backend.entity.Permission;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.repository.PermissionRepository;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Optional;

@Component
public class ECommerceInitializer implements CommandLineRunner {

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        // Initialisation des permissions e-commerce
        createECommercePermissions();
        
        // Initialisation des rôles e-commerce
        createECommerceRoles();
        
        // Création d'utilisateurs de test si nécessaire
        createTestUsers();
    }

    private void createECommercePermissions() {
        // Permissions pour les produits
        createPermissionIfNotExists("PRODUIT_READ", "Lire les produits");
        createPermissionIfNotExists("PRODUIT_CREATE", "Créer des produits");
        createPermissionIfNotExists("PRODUIT_UPDATE", "Mettre à jour des produits");
        createPermissionIfNotExists("PRODUIT_DELETE", "Supprimer des produits");
        
        // Permissions pour les catégories
        createPermissionIfNotExists("CATEGORIE_READ", "Lire les catégories");
        createPermissionIfNotExists("CATEGORIE_CREATE", "Créer des catégories");
        createPermissionIfNotExists("CATEGORIE_UPDATE", "Mettre à jour des catégories");
        createPermissionIfNotExists("CATEGORIE_DELETE", "Supprimer des catégories");
        
        // Permissions pour les commandes
        createPermissionIfNotExists("COMMANDE_READ", "Lire toutes les commandes");
        createPermissionIfNotExists("COMMANDE_UPDATE", "Mettre à jour le statut des commandes");
        
        // Permissions existantes pour les utilisateurs/rôles
        createPermissionIfNotExists("USER_READ", "Lire les utilisateurs");
        createPermissionIfNotExists("USER_CREATE", "Créer des utilisateurs");
        createPermissionIfNotExists("USER_UPDATE", "Mettre à jour des utilisateurs");
        createPermissionIfNotExists("USER_DELETE", "Supprimer des utilisateurs");
        createPermissionIfNotExists("ROLE_READ", "Lire les rôles");
        createPermissionIfNotExists("ROLE_CREATE", "Créer des rôles");
        createPermissionIfNotExists("ROLE_UPDATE", "Mettre à jour des rôles");
        createPermissionIfNotExists("ROLE_DELETE", "Supprimer des rôles");
    }

    private void createECommerceRoles() {
        // Création du rôle ADMIN s'il n'existe pas
        Role adminRole = createRoleIfNotExists("ADMIN", "Administrateur avec tous les droits");
        
        // Assigner toutes les permissions au rôle admin
        adminRole.setPermissions(new HashSet<>(permissionRepository.findAll()));
        roleRepository.save(adminRole);
        
        // Création du rôle CLIENT s'il n'existe pas
        Role clientRole = createRoleIfNotExists("CLIENT", "Client de la boutique en ligne");
        // Pas de permissions spécifiques, juste l'authentification
        roleRepository.save(clientRole);
        
        // Création du rôle VENDEUR s'il n'existe pas
        Role vendeurRole = createRoleIfNotExists("VENDEUR", "Vendeur / Gestionnaire de produits");
        // Permissions pour les produits et catégories
        vendeurRole.setPermissions(new HashSet<>(Arrays.asList(
            findPermissionByNom("PRODUIT_READ"),
            findPermissionByNom("PRODUIT_CREATE"),
            findPermissionByNom("PRODUIT_UPDATE"),
            findPermissionByNom("CATEGORIE_READ"),
            findPermissionByNom("CATEGORIE_CREATE"),
            findPermissionByNom("CATEGORIE_UPDATE"),
            findPermissionByNom("COMMANDE_READ"),
            findPermissionByNom("COMMANDE_UPDATE")
        )));
        roleRepository.save(vendeurRole);
    }

    private void createTestUsers() {
        // Création d'un utilisateur admin s'il n'existe pas
        if (!userRepository.existsByEmail("admin@example.com")) {
            User admin = new User();
            admin.setNom("Administrateur");
            admin.setEmail("admin@example.com");
            admin.setMotDePasse(passwordEncoder.encode("password"));
            admin.setActif(true);
            admin.addRole(roleRepository.findByNom("ADMIN").orElseThrow());
            userRepository.save(admin);
        }
        
        // Création d'un utilisateur client s'il n'existe pas
        if (!userRepository.existsByEmail("client@example.com")) {
            User client = new User();
            client.setNom("Client Test");
            client.setEmail("client@example.com");
            client.setMotDePasse(passwordEncoder.encode("password"));
            client.setActif(true);
            client.addRole(roleRepository.findByNom("CLIENT").orElseThrow());
            userRepository.save(client);
        }
        
        // Création d'un utilisateur vendeur s'il n'existe pas
        if (!userRepository.existsByEmail("vendeur@example.com")) {
            User vendeur = new User();
            vendeur.setNom("Vendeur Test");
            vendeur.setEmail("vendeur@example.com");
            vendeur.setMotDePasse(passwordEncoder.encode("password"));
            vendeur.setActif(true);
            vendeur.addRole(roleRepository.findByNom("VENDEUR").orElseThrow());
            userRepository.save(vendeur);
        }
    }

    private Permission createPermissionIfNotExists(String nom, String description) {
        Optional<Permission> permissionOpt = permissionRepository.findByNom(nom);
        if (permissionOpt.isPresent()) {
            return permissionOpt.get();
        } else {
            Permission permission = new Permission();
            permission.setNom(nom);
            permission.setDescription(description);
            return permissionRepository.save(permission);
        }
    }
    
    private Role createRoleIfNotExists(String nom, String description) {
        Optional<Role> roleOpt = roleRepository.findByNom(nom);
        if (roleOpt.isPresent()) {
            return roleOpt.get();
        } else {
            Role role = new Role();
            role.setNom(nom);
            role.setDescription(description);
            return roleRepository.save(role);
        }
    }
    
    private Permission findPermissionByNom(String nom) {
        return permissionRepository.findByNom(nom)
                .orElseThrow(() -> new RuntimeException("Permission not found: " + nom));
    }
}
