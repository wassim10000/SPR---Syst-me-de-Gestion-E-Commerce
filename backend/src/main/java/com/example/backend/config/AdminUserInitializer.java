package com.example.backend.config;

import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.repository.PermissionRepository;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AdminUserInitializer {

    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PermissionRepository permissionRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostConstruct
    @Transactional
    public void init() {
        try {
            // Ensure all permissions exist first
            String[] permissionNames = {
                "USER_READ", "USER_CREATE", "USER_UPDATE", "USER_DELETE",
                "ROLE_READ", "ROLE_CREATE", "ROLE_UPDATE", "ROLE_DELETE",
                "PERMISSION_READ", "PERMISSION_CREATE", "PERMISSION_UPDATE", "PERMISSION_DELETE",
                "HISTORY_READ"
            };

            // Create permissions if they don't exist
            for (String permissionName : permissionNames) {
                if (!permissionRepository.existsByNom(permissionName)) {
                    permissionRepository.createPermission(permissionName, "Can " + permissionName.toLowerCase().replace("_", " "));
                }
            }

            // Create or get admin role
            Role adminRole = roleRepository.findByNom("ADMIN")
                    .orElseGet(() -> {
                        Role role = new Role();
                        role.setNom("ADMIN");
                        role.setDescription("Administrator with full permissions");
                        return roleRepository.save(role);
                    });

            // Add all permissions to admin role
            for (String permissionName : permissionNames) {
                roleRepository.addPermissionToRole(adminRole.getId(), 
                    permissionRepository.findByNom(permissionName).get().getId());
            }

            // Create or update admin user
            String adminEmail = "admin@example.com";
            if (!userRepository.existsByEmail(adminEmail)) {
                User adminUser = new User();
                adminUser.setNom("Admin");
                adminUser.setEmail(adminEmail);
                adminUser.setMotDePasse(passwordEncoder.encode("admin123"));
                adminUser.setActif(true);
                adminUser = userRepository.save(adminUser);
                
                // Assign admin role to user
                userRepository.addRoleToUser(adminUser.getId(), adminRole.getId());
                
                System.out.println("\n==========================================");
                System.out.println("ADMIN USER CREATED");
                System.out.println("Email: " + adminEmail);
                System.out.println("Password: admin123");
                System.out.println("Role: ADMIN");
                System.out.println("==========================================\n");
            } else {
                System.out.println("\n==========================================");
                System.out.println("ADMIN USER ALREADY EXISTS");
                System.out.println("Email: " + adminEmail);
                System.out.println("==========================================\n");
            }
        } catch (Exception e) {
            System.err.println("Error initializing admin user: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
