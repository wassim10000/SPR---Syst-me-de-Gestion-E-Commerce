package com.example.backend.controller;

import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.LoginResponse;
import com.example.backend.dto.SignupRequest;
import com.example.backend.dto.UserDTO;
import com.example.backend.entity.User;
import com.example.backend.entity.Role;
import com.example.backend.security.JwtTokenProvider;
import com.example.backend.service.UserService;
import com.example.backend.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserService userService;

    @Autowired
    private RoleService roleService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getMotDePasse()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        
        User user = userService.findByEmail(loginRequest.getEmail());
        UserDTO userDTO = convertToDTO(user);
        
        LoginResponse response = new LoginResponse();
        response.setToken(jwt);
        response.setUser(userDTO);
        response.setPermissions(user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(permission -> permission.getNom())
                .collect(Collectors.toSet()));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signupRequest) {
        User user = new User();
        user.setNom(signupRequest.getNom());
        user.setEmail(signupRequest.getEmail());
        user.setMotDePasse(signupRequest.getMotDePasse());
        user.setActif(true);

        // Ajouter le rôle USER par défaut
        Set<Role> roles = new HashSet<>();
        Role userRole = roleService.findByNom("USER")
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setNom("USER");
                    newRole.setDescription("Rôle utilisateur par défaut");
                    return roleService.create(newRole);
                });
        roles.add(userRole);
        user.setRoles(roles);

        User createdUser = userService.create(user);
        UserDTO userDTO = convertToDTO(createdUser);
        return ResponseEntity.ok(userDTO);
    }
    
    /**
     * Renvoie les informations de l'utilisateur actuellement authentifié
     * @return Les détails de l'utilisateur connecté
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCurrentUser() {
        // Récupérer l'utilisateur actuellement authentifié
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userService.findByEmail(email);
        UserDTO userDTO = convertToDTO(user);
        
        // Ajouter les permissions de l'utilisateur (les noms de ses permissions)
        Set<String> permissions = user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(permission -> permission.getNom())
                .collect(Collectors.toSet());
        
        // Créer une réponse avec les informations de l'utilisateur et ses permissions
        LoginResponse response = new LoginResponse();
        response.setUser(userDTO);
        response.setPermissions(permissions);
        
        return ResponseEntity.ok(response);
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setNom(user.getNom());
        dto.setEmail(user.getEmail());
        dto.setActif(user.isActif());
        dto.setRoles(user.getRoles().stream()
                .map(role -> role.getNom())
                .collect(Collectors.toSet()));
        return dto;
    }
} 